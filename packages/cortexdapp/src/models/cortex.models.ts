import { Elements } from "react-flow-renderer";
import Moralis from "moralis";

export interface CortexPayload {
  name: string;
  chainId: string;
  createdBy: Moralis.User;
  elements: Elements;
}

export interface CortexMoralisEntity extends CortexPayload {
  id: string;
}

export interface CtxVariablePayload {
  name: string;
  value: string;
  cortexId: string;
}

export interface CtxVariableMoralisEntity extends CtxVariablePayload {
  id: string;
}
