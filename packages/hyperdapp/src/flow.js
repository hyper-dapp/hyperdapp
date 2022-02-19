import prolog from '../vendor/tau-prolog/modules/core.js'
import importJsModule from '../vendor/tau-prolog/modules/js.js'
import importListsModule from '../vendor/tau-prolog/modules/lists.js'
import importPromisesModule from '../vendor/tau-prolog/modules/promises.js'

importJsModule(prolog)
importListsModule(prolog)
importPromisesModule(prolog)

export async function createFlow(flowCode, {
  onCallFn,
  onCallHttp,
}) {

  // The "global" context that tau prolog code has access to
  // We set this to a variable so functions close over their own objects,
  // as opposed to an always up to date reference via prolog.__env
  const env = {

    context: {
      // Internal state
      __: {
        hasInit: false,
        lockRegistering: false,
      },

      me: {
        // Populated via init/0
        address: null
      },

      // Populated by address/2
      address: {},

      // Populated by oracle/3
      oracle: {},
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

    // For security, we only want to allow specifying addresses & oracles before and during init/1.
    // However, Prolog can asserta/assertz at anytime.
    // To work around this, we store valid addresses in an external JS object,
    // then lock writes after a certain point.
    registerAddress(id, addr) {
      if (env.context.__.lockRegistering) {
        throw new Error('[hyperdapp] Addresses locked')
      }
      if (env.context.address[id]) {
        throw new Error(`[hyperdapp] Address already defined: '${id}'`)
      }
      env.context.address[id] = addr.toLowerCase()
    },

    registerOracle(id, permission, host) {
      if (env.context.__.lockRegistering) {
        throw new Error('[hyperdapp] Oracles locked')
      }
      if (env.context.oracle[id]) {
        throw new Error(`[hyperdapp] Oracle already defined: '${id}'`)
      }
      env.context.oracle[id] = { host, permission }
    },

    async callFn(targetAddress, functionSig, mutability, paramTypes, args, returnType, options) {
      // TODO: Inspect library code to determine why errors here do not throw
      // console.log("callFn", targetAddress, functionSig, paramTypes, args, returnType)

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
    },

    async callHttp(url, rawOptions) {
      const options = {}
      for (let [key, val] of rawOptions) {
        options[key] = val
      }
      const result = await onCallHttp({
        url,
        options
      })
      return result
    },
  }

  prolog.__env = env

  const session = prolog.create()

  await tryCatchProlog(async () => {
    await session.promiseConsult(`
      ${BASE_CODE}
      ${
        // TODO SECURITY: Parse and disallow certain built-ins
        flowCode
      }
    `)
    session.thread.warnings.map(w =>
      console.warn(w.toJavaScript({ quoted: true }))
    )
  })()


  let currentSigner = null
  let currentBlock = { number: 0, cache: {} }

  function updateCurrentBlock(blockNum) {
    if (blockNum !== currentBlock.number) {
      currentBlock = { number: blockNum, cache: {} }
    }
  }

  function afterInit(fn) {
    return async (...args) => {
      if (!env.context.__.hasInit) {
        console.warn("[Warning] Hyperdapp flow has not init")
        return []
      }
      return await fn(...args)
    }
  }

  const api = {
    init: tryCatchProlog(
      async function init (signer, signerAddress, blockNum) {
        currentSigner = signer
        env.context.me.address = signerAddress

        updateCurrentBlock(blockNum)

        await session.promiseQuery(`register_addresses, current_predicate(init/0), init.`)
        for await (let answer of session.promiseAnswers()) {
          // flush
        }

        await session.promiseQuery(`post_init.`)
        for await (let answer of session.promiseAnswers()) {
          // flush
        }

        env.context.__.hasInit = true
        env.context.__.lockRegistering = true
      }
    ),

    getPrompts: tryCatchProlog(afterInit(
        async function getPrompts(blockNum) {
        updateCurrentBlock(blockNum)

        let prompts = []

        await session.promiseQuery(`prompt_list(Prompt).`)

        for await (let answer of session.promiseAnswers()) {
          // console.log('->>', session.format_answer(answer), answer)
          const prompt = answer.links.Prompt.toJavaScript({ quoted: true })
          prompts.push(serializeNonJsonValues(prompt))
          // console.log(prompts[prompts.length-1])
        }
        return prompts
      }
    )),

    matchPrompts: tryCatchProlog(afterInit(
      async function matchPrompts(blockNum, matchQuery, selectVariable) {
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
      }
    )),

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

    execute: tryCatchProlog(async function execute(actions) {
      if (!env.context.__.hasInit) {
        console.warn("Hyperdapp flow has not init")
        return { effects: [] }
      }
      // console.log('Executing', actions)
      const effects = []
      await session.promiseQuery(`execute_all(${arrayToString(actions)}, Effects0), terms_to_list(Effects0, Effects).`)

      for await (let answer of session.promiseAnswers()) {
        // Effects
        // console.log('!->>', session.format_answer(answer), answer)
        const newEffects = answer.links.Effects.toJavaScript({ quoted: true })
        // console.log(newEffects)
        effects.push(...newEffects)
      }
      return { effects }
    }),

    query: tryCatchProlog(afterInit(
      async function query(query) {
        let answers = []
        await session.promiseQuery(query)

        for await (let answer of session.promiseAnswers()) {
          // console.log('->>', session.format_answer(answer), answer)
          // console.log('->>', answer)
          let result = {}
          for (let variable in answer.links) {
            result[variable] = answer.links[variable].toJavaScript({ quoted: true })
          }
          answers.push(result)
          // console.log(answers[answers.length-1])
        }
        return answers
      }
    )),
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
    ? x.toString() + 'n'
    : x
  )
}

function tryCatchProlog(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    }
    catch(err) {
      if (err instanceof Error) {
        throw err
      }
      throw new Error(err.args[0].toJavaScript())
    }
  }
}


const BASE_CODE = `
:- use_module(library(lists)).
:- use_module(library(js)).

:- dynamic(effect/1).
:- dynamic(address/2).
:- dynamic(oracle/3).

:- op(290, yfx, '++').
:- op(800, xfx, or).
:- op(950, yfx, '??').
:- op(985, yfx, then).
:- op(985, yfx, else).
:- op(985, yfx, elseif).
:- op(990, fx, if).

'??'(Pred, Err) :- Pred -> true; throw(assert_error(Err)).

if(X) :- (if_then(X, Then) -> if_call(Then); true).

if_then(then(elseif(Try, Cond), MaybeThen), Then) :-
  !,
  (if_then(Try, Then) -> true; call(Cond), Then = MaybeThen).
if_then(then(Cond, Then), Then)  :-
  !,
  call(Cond).
if_then(else(Try, MaybeThen), Then) :-
  !,
  (if_then(Try, Then) -> true; Then = MaybeThen).

if_call({Terms}) :- !, call(Terms).
if_call(Terms)   :- call(Terms).

or(X,Y) :- call(X) -> true; call(Y).

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


post_init :-
  register_addresses.

post_init :-
  register_oracles.


register_addresses :-
  current_predicate(address/2),
  address(Id, Addr),
  (ground(Id), ground(Addr)) ?? 'address/2 arguments must be ground',
  apply(registerAddress, [Id, Addr], _),
  retract(address(Id, Addr)).

register_oracles :-
  current_predicate(oracle/3),
  oracle(Id, Perm, Host),
  (ground(Id), ground(Perm), ground(Host)) ?? 'oracle/3 arguments must be ground',
  %% TODO: Validate Host
  apply(registerOracle, [Id, Perm, Host], _),
  retract(oracle(Id, Perm, Host)).

%% TODO: Validate function signatures for better dx
%% post_init :- abi(id, fns), ...


ctx_get(Key, Value) :- prop(context, Top), get_(Top, Key, Value).

get(Key, Value) :- prop(context, Top), get_(Top, Key, Value), !.
get(Key, Value) :- prop(uiState, Top), get_(Top, Key, Value), !.

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

%%
%% Contract function calls
%%
call_fn(Contract, Calldata, Result) :-
  call_fn(Contract, Calldata, Result, []).

call_fn(Contract, Calldata, Result, Options0) :-
  parse_call_fn_options(ctx(Contract, Calldata), Options0, Options),
  ground(Contract) ?? contract_not_ground(Contract),
  ground(Calldata) ?? calldata_not_ground(Contract, Calldata),
  is_list(Result) ?? 'Return value must be a list',

  ctx_get(address/Contract, Addr) ?? contract_address_not_found(Contract),
  abi(Contract, Abi) ?? 'Contract ABI not found',

  Calldata =.. [Fn | Args0] ?? 'Invalid Calldata',
  parse_call_fn_args(Contract, Args0, Args),

  (
    member(X, Abi),
    abi_fn(X, FnSig, Ret, Mut),
    FnSig =.. [Fn | ParamsTypes],
    length(ParamsTypes, N),
    length(Args, N),
    !
  ) ?? 'ABI function not found',

  terms_to_list(Options, Opts),
  fn_sig_atom(Fn, ParamsTypes, FnSigAtom),
  apply(callFn, [Addr, FnSigAtom, Mut, ParamsTypes, Args, Ret, Opts], Result).

%% TODO: Switch to [key: value] syntax
%%
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


parse_call_fn_args(Ctx, [X|Xs], [Y|Ys]) :-
  ground(X) ?? unground_fn_call_arg(X, Ctx),
  (
    %% Convert tuple(x,y) to [x, y]
    %%
    X =.. [tuple | TupleArgs] ->
    Y = TupleArgs;
    Y = X
  ),
  parse_call_fn_args(Ctx, Xs, Ys).

parse_call_fn_args(_, [], []).


%% Stringify to ethers-compatible string
%%
fn_sig_atom(Fn, Params, Atom) :-
  findall(Strs, (member(P, Params), fn_sig_atom_(P, Strs)), Parts0),
  atomic_list_concat(Parts0, ',', ParamsAtom),
  atomic_list_concat([Fn, '(', ParamsAtom, ')'], Atom).

fn_sig_atom_(array(Type), Atom) :-
  !,
  fn_sig_atom_(Type, Atom0),
  atom_concat(Atom0, '[]', Atom).

fn_sig_atom_(Tuple, Atom) :-
  Tuple =.. [tuple | Types],
  !,
  findall(A, (member(T, Types), fn_sig_atom_(T, A)), Atoms),
  atomic_list_concat(Atoms, ',', TypesAtom),
  atomic_list_concat(['(', TypesAtom, ')'], Atom).

fn_sig_atom_(Type, Type).

%%
%% Oracle HTTP calls
%%
call_http(Contract, Calldata, Result) :-
  call_http(Contract, Calldata, Result, []).

call_http(Oracle, Path, Result, Options0) :-
  parse_call_http_options(ctx(Oracle, Path), Options0, Options),
  ground(Oracle) ?? 'Oracle must be ground',
  ground(Path) ?? 'Path must be ground',

  ctx_get(oracle/Oracle/host, Host) ?? oracle_not_found(Oracle),

  %% TODO: Check for and allow POST/PUT/DELETE
  %% ctx_get(oracle/Oracle/permission, Perm),

  ground(Path) ?? path_not_ground(Path),
  resolve_url(Host, Path, Url) ?? invalid_url(Host, Path),

  apply(callHttp, [Url, Options], Result).

parse_call_http_options(Ctx, [Key: Value | Xs], [[Key, Value] | Ys]) :-
  !,
  parse_call_http_options(Ctx, Xs, Ys).

parse_call_http_options(Ctx, [X | _], _) :- throw(invalid_call_http_option(X, Ctx)).

parse_call_http_options(_, [], []).

%% TODO: Use term expansion to resolve ++ generically. Maybe.
%%
resolve_url(Host, A ++ B, Result) :-
  !,
  to_atom(A, A1),
  to_atom(B, B1),
  atom_concat(A1, B1, C),
  resolve_url(Host, C, Result).

resolve_url(Host, Path, Result) :-
  atom_concat('https://', Host, Origin),
  atom_concat(Origin, Path, Result).


to_atom(X, X) :- atom(X), !.
to_atom(X, Y) :- number(X), !, atom_number(Y, X).
to_atom(X, _) :- throw(cannot_convert_to_atom(X)).

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


is_mutability(X) :- member(X, [pure, view, payable]).


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
`
