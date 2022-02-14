:- set_prolog_flag(double_quotes, string).
:- use_module(library(lists)).
:- use_module(library(js)).

:- dynamic(effect/1).

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
  _/_ \= Ret0,
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
  \+ compound(X), !,
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
  \+ compound(Y),
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
