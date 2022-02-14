export type MethodStateMutability = "nonpayable" | "payable" | "view";

export interface MethodPayload {
  name: string;
  type: "address" | "bytes" | "uint8" | "uint256" | "eth";
}

export interface ContractMethod {
  constant: boolean;
  inputs: MethodPayload[];
  name: string;
  outputs: MethodPayload[];
  payable: boolean;
  signature: string;
  stateMutability: MethodStateMutability;
  type: "event" | "function";
}
