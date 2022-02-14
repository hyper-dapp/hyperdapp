export interface ContractEvent {
  address: string;
  blockHash: string;
  blockNumber: number;
  event: string;
  id: string;
  logIndex: string;
  raw: {
    data: string;
    topics: string[];
  };
  removed: false;
  returnValues: {
    [key: string]: string;
  };
  signature: string;
  transactionHash: string;
  transactionIndex: number;
}
