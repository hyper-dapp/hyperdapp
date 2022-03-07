export interface CtxVariablePayload {
  name: string;
  value: string;
  cortexId: string;
}

export interface CtxVariableMoralisEntity extends CtxVariablePayload {
  id: string;
}
