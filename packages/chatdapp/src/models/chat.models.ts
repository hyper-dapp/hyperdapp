import Moralis from "moralis";

export enum ChatType {
  CONTRACT = "contract",
  ROOM = "room",
}

export interface ChatPayload {
  chainId: string;
  createdBy: Moralis.User;
  isPrivate: boolean;
  name: string;
  type: ChatType;
  users: string[];
  contractAddress?: string;
}

export interface ChatMoralisEntity extends ChatPayload {
  id: string;
}
