import prolog from '../vendor/tau-prolog/modules/core.js'
import importJsModule from '../vendor/tau-prolog/modules/js.js'
import importListsModule from '../vendor/tau-prolog/modules/lists.js'
import importPromisesModule from '../vendor/tau-prolog/modules/promises.js'

importJsModule(prolog)
importListsModule(prolog)
importPromisesModule(prolog)

export async function createFlow(flowCode, {
  onCallFn,
}) {

  // The "global" context that tau prolog code has access to
  // We set this to a variable so functions close over their own objects,
  // as opposed to an always up to date reference via prolog.__env
  const env = {

    context: {
      me: {
        // Populated via init()
        address: null
      },
    },

    uiState: {},

    setUiState(path, value) {
      // console.log("Setting", path, value)
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

    async callFn(targetAddress, functionName, mutability, paramTypes, args, returnType, options) {
      // TODO: Inspect library code to determine why errors here do not throw
      // console.log("CALLING", targetAddress, functionName, paramTypes, args, returnType)

      const functionSig = `${functionName}(${paramTypes.join(',')})`
      // console.log("sig:", functionSig)

      let value = 0n
      for (let opt of options) {
        if (opt[0] === 'value') {
          value = opt[1]
        }
      }

      const returnValue = await onCallFn({
        args,
        block: currentBlock,
        value,
        signer: currentSigner,
        contractAddress: targetAddress,
        mutability: {
          view: mutability.includes('view'),
          payable: mutability.includes('payable'),
        },
        paramTypes,
        returnType,
        functionSig,
      })
      // console.log(functionSig, '=>', returnValue)

      return returnValue.map((value, i) =>
        // Maintain internal consistency by ensuring all addresses are always lowercase
        returnType[i] === 'address'
        ? value.toLowerCase()
        : value
      )
    }
  }

  prolog.__env = env

  const session = prolog.create()

  await session.promiseConsult(`
    :- set_prolog_flag(double_quotes, string).
    :- use_module(library(lists)).
    :- use_module(library(js)).
    :- op(950, yfx, '??').
    :- dynamic(effect/1).

    '??'(Pred, Err) :- Pred -> true; throw(assert_error(Err)).

    prompt_list(Out) :-
      prompt(Prompt),
      terms_to_list(Prompt, Out).


    prompt_once(Key) :-
      ground(Key) ?? 'prompt_once key must be ground',
      Key1 = internal__ / prompt_once / Key,
      (get(Key1, true) ->
        false;
        set(Key1, true)
      ).


    get(Key, Value) :- prop(context, Top), get_(Top, Key, Value).
    get(Key, Value) :- prop(uiState, Top), get_(Top, Key, Value).

    get_(Top, Ns/Key, Value) :-
      !,
      get_(Top, Ns, NsObj),
      prop(NsObj, Key, Value).

    get_(Top, TopLevelKey, Value) :-
      prop(Top, TopLevelKey, Value).

    set(Path0, Value) :-
      path_flat(Path0, Path),
      apply(setUiState, [Path, Value], _).

    path_flat(Path, List) :-
      path_list(Path, List0),
      reverse(List0, List).

    path_list(A/B, [B | Rest]) :- !, path_list(A, Rest).
    path_list(A, [A]).

    call_fn(Contract, Calldata, Result) :-
      call_fn(Contract, Calldata, Result, []).

    call_fn(Contract, Calldata, Result, Options0) :-
      parse_call_fn_options(ctx(Contract, Calldata), Options0, Options),
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

      terms_to_list(Options, Opts),
      apply(callFn, [Addr, Fn, Mut, ParamsTypes, Args, Ret, Opts], Result).

    parse_call_fn_options(Ctx, [X|Xs], [Y|Ys]) :-
      ground(X) ?? unground_fn_call_option(X, Ctx),
      (
        % TODO: Add more options here when needed
        value(eth(N0)) = X, number(N0) ?? invalid_fn_call_option(eth(N0), Ctx) ->
          N is N0 * 10 ** 18,
          Y = value(N);
        value(N) = X, number(N) ?? invalid_fn_call_option(N, Ctx) ->
          Y = X;
        false
      ) ?? invalid_call_fn_option(X, Ctx),
      parse_call_fn_options(Ctx, Xs, Ys).

    parse_call_fn_options(_, [], []).

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


    prompt_exists(Query, Ps) :-
      is_list(Ps),
      !,
      member(P, Ps),
      prompt_exists(Query, P).

    prompt_exists(Query, P) :-
      subsumes_term(Query, P),
      Query = P.


    term_to_list(X, Y) :-
      terms_to_list([X], [Y]).

    terms_to_list([X | Xs], [X | Ys]) :-
      \\+ compound(X), !,
      terms_to_list(Xs, Ys).

    terms_to_list([X | Xs], [['[list]'|Y] | Ys]) :-
      is_list(X), !,
      terms_to_list(X, Y),
      terms_to_list(Xs, Ys).

    terms_to_list([X | Xs], [[Atom|Args] | Ys]) :-
      X =.. [Atom | Args0],
      terms_to_list(Args0, Args),
      terms_to_list(Xs, Ys).

    terms_to_list([], []).


    list_to_term(X, Y) :-
      list_to_terms([X], [Y]).

    list_to_terms([Y | Ys], [Y | Xs]) :-
      \\+ compound(Y),
      !,
      list_to_terms(Ys, Xs).

    list_to_terms([['[list]'|ListItems0] | Ys], [ListItems | Xs]) :-
      !,
      list_to_terms(ListItems0, ListItems),
      list_to_terms(Ys, Xs).

    list_to_terms([[Atom|Args0] | Ys], [X | Xs]) :-
      list_to_terms(Args0, Args),
      X =.. [Atom | Args],
      list_to_terms(Ys, Xs).

    list_to_terms([], []).


    %%
    %% Execution and effects
    %%

    %% Expects a list of actions.
    %% Example payload:
    %%   ['[list]', [foo, 10, 20], [bar, 30]]
    %%
    execute_all(Payload, Effects) :-
      retractall(effect(_)),
      (['[list]' | ActionLists] = Payload) ?? invalid_actions_1(Payload),
      list_to_terms(ActionLists, Actions) ?? invalid_actions_2(ActionLists),
      execute_all_(Actions),
      findall(E, effect(E), Effects).

    execute_all_([Action | Rest]) :-
      call(Action) ?? action_failed(Action),
      execute_all_(Rest).

    execute_all_([]).

    log_message(Term) :-
      assertz(effect(log_message(Term))).

    ${
      // TODO SECURITY: Parse and disallow certain built-ins
      flowCode
    }
  `)

  // await new Promise(() => {})


  let currentSigner = null
  let currentBlock = { number: 0, cache: {} }

  function updateCurrentBlock(blockNum) {
    if (blockNum !== currentBlock.number) {
      currentBlock = { number: blockNum, cache: {} }
    }
  }

  const api = {
    async init(signer, signerAddress, blockNum) {
      currentSigner = signer
      env.context.me.address = signerAddress

      updateCurrentBlock(blockNum)

      await session.promiseQuery(`current_predicate(init/0), init.`)
      for await (let answer of session.promiseAnswers()) {
        // flush
      }
    },

    async getPrompts(blockNum) {
      updateCurrentBlock(blockNum)

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
          const prompt = answer.links.Prompt.toJavaScript({ quoted: true })
          prompts.push(serializeNonJsonValues(prompt))
          // console.log(prompts[prompts.length-1])
        }
      }
      catch(err) {
        console.log("o no", err.toString(), err) // TODO: Why no throw for async?
      }
      return prompts
    },

    async matchPrompts(blockNum, matchQuery, selectVariable) {
      updateCurrentBlock(blockNum)

      const selectQuery = selectVariable
        ? `, (term_to_list(${selectVariable}, ${selectVariable}Out) -> true; ${selectVariable}Out = ${selectVariable})`
        : ''
      await session.promiseQuery(`prompt(Prompt), prompt_exists(${matchQuery}, Prompt)${selectQuery}.`)

      let answers = []
      for await (let answer of session.promiseAnswers()) {
        // console.log('->>', session.format_answer(answer), answer)
        answers.push(
          selectVariable
          ? { [selectVariable]: answer.links[selectVariable+'Out'].toJavaScript({ quoted: true }) }
          : {}
        )
        // console.log(answers[answers.length-1])
      }

      return answers
    },

    async promptCount(blockNum, query) {
      const results = await api.matchPrompts(blockNum, query)
      return results.length
    },

    async effectCount(query) {
      await session.promiseQuery(`effect(${query}).`)
      let answerCount = 0
      for await (let answer of session.promiseAnswers()) {
        // console.log('->>', session.format_answer(answer), answer)
        answerCount += 1
      }
      return answerCount
    },

    async execute(actions) {
      // console.log('Executing', actions)
      const effects = []
      try {
        await session.promiseQuery(`execute_all(${arrayToString(actions)}, Effects0), terms_to_list(Effects0, Effects).`)
        for await (let answer of session.promiseAnswers()) {
          // Effects
          // console.log('!->>', session.format_answer(answer), answer)
          const newEffects = answer.links.Effects.toJavaScript({ quoted: true })
          // console.log(newEffects)
          effects.push(...newEffects)
        }
      }
      catch(err) {
        // console.log("Execute error", err)
        if (err instanceof Error) {
          throw err
        }
        throw new Error(err.args[0].toJavaScript())
      }
      return { effects }
    },

    async query(query) {
      await session.promiseQuery(query)

      let answers = []
      for await (let answer of session.promiseAnswers()) {
        // console.log('->>', session.format_answer(answer), answer)
        console.log('->>', answer)
        let result = {}
        for (let variable in answer.links) {
          // result[variable] = answer.links[variable].toJavaScript({ quoted: true })
        }
        answers.push(result)
        // console.log(answers[answers.length-1])
      }

      return answers
    },
  }

  return api
}

function arrayToString(arr) {
  if (Array.isArray(arr)) {
    return `[${arr.map(arrayToString).join(',')}]`
  }
  else {
    return arr
  }
}

function serializeNonJsonValues(xs) {
  return xs.map(x =>
    Array.isArray(x)
    ? serializeNonJsonValues(x)
    : typeof x === 'bigint'
    ? '0x' + x.toString(16)
    : x
  )
}
