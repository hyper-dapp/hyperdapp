import Moralis from "moralis";
import { FlowExportObject } from "react-flow-renderer";

export interface CortexAbi {
  name: string;
  address: string;
}

export interface CortexVariable {
  name: string;
  value: string;
}

export interface CortexPayload {
  name: string;
  chainId: string;
  createdBy: Moralis.User;
  abis: CortexAbi[];
  variables: CortexVariable[];
  flow: FlowExportObject;
}

export interface CortexMoralisEntity extends CortexPayload {
  id: string;
}
