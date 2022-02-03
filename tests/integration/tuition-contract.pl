address(tuition, '{{contractAddr}}').

abi(tuition, [
  owner: address / view,
  locked: bool / view,
  'TREASURY': address / view,
  contribute: payable,
  previousOwner: address / view,
  isStaff(address): bool / view,
  balance(address): uint256 / view,
  renounceOwnership,
  refundUser(address),
  alreadyPaid(address): bool / view,
  transferOwnership(address),
  manageStaff(address, bool),
  changeTreasuryAddress(address),
  moveStudentFundsToTreasury(address),
  permanentlyMoveAllFundsToTreasuryAndLockContract
]).

prompt([ text('You are staff')     ]) :- is_staff(true).
prompt([ text('You are not staff') ]) :- is_staff(false).

prompt(Actions) :- findall(Action, action(Action), Actions).

action(
  button('Owner', [
    call_fn(tuition, owner, [Addr]),
    log_message(text('Owner address: ', Addr))
  ])
).

is_staff(Bool) :-
  get(me/address, Addr),
  call_fn(tuition, isStaff(Addr), [Bool]).
