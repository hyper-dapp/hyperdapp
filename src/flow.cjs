const prolog = require('../vendor/tau-prolog/modules/core.cjs')
require('../vendor/tau-prolog/modules/lists.cjs')(prolog)
require('../vendor/tau-prolog/modules/js.cjs')(prolog)
require('../vendor/tau-prolog/modules/promises.cjs')(prolog)

exports.createFlow = createFlow

async function createFlow(flowCode, {
  onCallFn,
  userAddress,
}) {

  // The "global" context that tau prolog code has access to
  // We set this to a variable so functions close over their own objects,
  // as opposed to an always up to date reference via prolog.__env
  const env = {

    context: {
      me: {
        address: userAddress
      },
    },

    uiState: {},

    setUiState(path, value) {
      console.log("Setting", path, value)
      if (path.length === 0) {
        throw new Error('set/2 - No path provided')
      }
      let current = env.uiState
      for (let prop of path.slice(0, path.length-1)) {
        if (current[prop] === undefined) {
          current[prop] = {}
        }
        current = current[prop]
      }
      const lastKey = path[path.length-1]
      current[lastKey] = value
    },

    async callFn(targetAddress, functionName, mutability, paramTypes, args, returnType) {
      // TODO: Inspect library code to determine why errors here do not throw
      // console.log("CALLING", targetAddress, functionName, paramTypes, args, returnType)

      const functionSig = `${functionName}(${paramTypes.join(',')})`
      // console.log("sig:", functionSig)

      return await onCallFn({
        args,
        signer: currentSigner,
        contract: targetAddress,
        mutability,
        paramTypes,
        returnType,
        functionSig,
      })
    }
  }

  prolog.__env = env

  const session = prolog.create()

  await session.promiseConsult(`
    :- use_module(library(lists)).
    :- use_module(library(js)).
    :- op(950, yfx, '??').

    '??'(Pred, Err) :- Pred -> true; throw(assert_error(Err)).


    prompt_list(Out) :-
      prompt(Prompt),
      terms_to_list(Prompt, Out).


    get(Key, Value) :- prop(context, Top), get_(Top, Key, Value).
    get(Key, Value) :- prop(uiState, Top), get_(Top, Key, Value), write(got(Key,Value)).

    get_(Top, Ns/Key, Value) :-
      !,
      get_(Top, Ns, NsObj),
      prop(NsObj, Key, Value).

    get_(Top, TopLevelKey, Value) :-
      prop(Top, TopLevelKey, Value).

    set(Path0, Value) :-
      write(settttting(Path0)),
      path_flat(Path0, Path),
      apply(setUiState, [Path, Value], _).

    path_flat(Path, List) :-
      path_list(Path, List0),
      reverse(List0, List).

    path_list(A/B, [B | Rest]) :- !, path_flat(A, Rest).
    path_list(A, [A]).


    call_fn(Contract, Calldata, Result) :-
      ground(Contract) ?? 'Contract must be ground',
      ground(Calldata) ?? 'Calldata must be ground',
      is_list(Result) ?? 'Return value must be a list',

      address(Contract, Addr) ?? 'Contract address not found',
      abi(Contract, Abi) ?? 'Contract ABI not found',

      Calldata =.. [Fn | Args] ?? 'Invalid Calldata',

      (
        member(X, Abi),
        abi_fn(X, FnSig, Ret, Mut),
        FnSig =.. [Fn | ParamsTypes],
        length(ParamsTypes, N),
        length(Args, N),
        !
      ) ?? 'ABI function not found',

      apply(callFn, [Addr, Fn, Mut, ParamsTypes, Args, Ret], Result).


    %%
    %% Parses our prolog term DSL into function return type and mutability data.
    %%
    %% Examples:
    %%
    %%   abi_fn(foo(10): bool, foo(10), [bool], []).
    %%   abi_fn(foo(10): view, foo(10), [], [view]).
    %%   abi_fn(foo(10): bool / view, foo(10), [bool], [view]).
    %%
    abi_fn(FnSig: RetMut, FnSig, Ret, Muts) :-
      !,
      abi_fn_retmut(RetMut, Ret0, Muts),
      % Hack to avoid matching terms that specify more than one return type
      _/_ \\= Ret0,
      (Ret0 = void -> Ret = []; Ret = [Ret0]).

    abi_fn(FnSig, FnSig, [], []).

    %
    % TODO: Require non-mutability is listed first lexically
    %
    abi_fn_retmut(Xs / X, Ret, [X|Muts]) :-
      is_mutability(X), !,
      abi_fn_retmut(Xs, Ret, Muts).

    abi_fn_retmut(Xs / X, X, Muts) :-
      !,
      abi_fn_retmut(Xs, X, Muts).

    abi_fn_retmut(X, Ret, [X]) :-
      is_mutability(X), !,
        (ground(Ret) -> true; Ret = void).
    abi_fn_retmut(X, X, []).


    is_mutability(X) :- member(X, [view, payable]).


    terms_to_list([], []) :- !.

    terms_to_list([X | Xs], [Y | Ys]) :-
      is_list(X),
      !,
      terms_to_list(X, Y),
      terms_to_list(Xs, Ys).

    terms_to_list([X | Xs], [Y | Ys]) :-
      compound(X),
      !,
      X =.. Y0,
      terms_to_list(Y0, Y),
      terms_to_list(Xs, Ys).

    terms_to_list([X | Xs], [X | Ys]) :-
      terms_to_list(Xs, Ys).


    execute_all([A | As], E) :-
      (execute(A), !; true),
      execute_all(As, E).

    execute_all([], [done]).


    execute([set, K, V]) :-
      (atom(K) -> Path = K; Path =.. K),
      set(Path, V).

    ${flowCode}
  `)

  // await new Promise(() => {})


  await session.promiseQuery(`current_predicate(init/0), init.`)
  for await (let answer of session.promiseAnswers()) {
    // flush
  }


  let currentSigner = null
  let currentBlock = { number: 0, cache: {} }

  return {
    async getPrompts(signer, blockNum) {
      currentSigner = signer
      if (blockNum !== currentBlock.number) {
        currentBlock = { number: blockNum, cache: {} }
      }

      let prompts = []

      try {
        // await session.promiseQuery(`call(greeter, greet, [Greeting]).`)
        await session.promiseQuery(`prompt_list(Prompt).`)
      }
      catch(err) {
        console.log("parse query error", err)
      }

      try {
        for await (let answer of session.promiseAnswers()) {
          // console.log('->>', session.format_answer(answer), answer)
          prompts.push(answer.links.Prompt.toJavaScript({ quoted: true }))
          // console.log(prompts[prompts.length-1])
        }
      }
      catch(err) {
        console.log("o no", err.toString(), err) // TODO: Why no throw for async?
      }
      return prompts
    },

    async execute(actions) {
      console.log("EXECUTE", arrayToString(actions))
      try {
        await session.promiseQuery(`execute_all(${arrayToString(actions)}, Effects).`)
        for await (let answer of session.promiseAnswers()) {
          // Effects
          console.log('!->>', session.format_answer(answer), answer)
          console.log(answer.links.Effects.toJavaScript({ quoted: true }))
        }
      }
      catch(err) {
        console.log("Execute error", err)
        throw new Error(err.args[0].toJavaScript())
      }
    }
  }
}

function arrayToString(arr) {
  if (Array.isArray(arr)) {
    return `[${arr.map(arrayToString).join(',')}]`
  }
  else {
    return arr
  }
}
