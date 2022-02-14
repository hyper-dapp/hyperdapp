address(tuition, '{{contractAddress}}').

abi(tuition, [
  owner: address / view,
  locked: bool / view,
  'TREASURY': address / view,
  previousOwner: address / view,
  isStaff(address): bool / view,
  balance(address): uint256 / view,
  alreadyPaid(address): bool / view,

  % Student
  contribute: payable,

  % Staff
  refundUser(address),
  moveStudentFundsToTreasury(address),

  % Owner
  manageStaff(address, bool),
  renounceOwnership,
  transferOwnership(address),
  changeTreasuryAddress(address),
  permanentlyMoveAllFundsToTreasuryAndLockContract
]).

init :-
  if (is_staff(true) or is_owner(true)) then {
    set(tab, choose), set(has_choice, true)
  }
  else {
    set(tab, student)
  }.

prompt([ text('You are staff')     ]) :- is_staff(true).
prompt([ text('You are not staff') ]) :- is_staff(false).

%%
%% Choose tab
%%
prompt([
  text('What kind of action do you want to take?'),
  button('Student', [ set(tab, student) ])
]) :-
  get(tab, choose).

prompt([ button('Staff', [ set(tab, staff) ]) ]) :- get(tab, choose).
prompt([ button('Admin', [ set(tab, admin) ]) ]) :- get(tab, choose).

%%
%% Student tab
%%
prompt([ text('Welcome to Shipyard\'s Tuition Portal') ]) :- get(tab, student), prompt_once(welcome).
prompt([
  button('Pay Deposit', [
    call_fn(tuition, contribute, [], [value(eth(1))])
  ])
]) :-
  get(tab, student),
  has_paid(false).

prompt([
  text('Congratulations! Your deposit has been registered.')
]) :-
  get(tab, student),
  has_paid(true).

%%
%% Staff Tab
%%
prompt([ text('Staff (TODO)') ]) :- get(tab, staff).

%%
%% Staff Tab
%%
prompt([ text('Admin (TODO)') ]) :- get(tab, admin).

%%
%% Helpers
%%
has_paid(Bool) :-
  get(me/address, Addr),
  call_fn(tuition, alreadyPaid(Addr), [Bool]).

is_staff(Bool) :-
  get(me/address, Addr),
  call_fn(tuition, isStaff(Addr), [Bool]).

is_owner(Bool) :-
  get(me/address, Addr),
  call_fn(tuition, owner, [Owner]),
  (Addr == Owner -> Bool = true; Bool = false).


% For testing
prompt(Actions) :- findall(Action, action(Action), Actions).
action(
  button('Owner', [
    call_fn(tuition, owner, [Addr]),
    log_message(text('Owner address: ', Addr))
  ])
).
