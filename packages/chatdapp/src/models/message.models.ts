import Moralis from "moralis";
import { ContractEvent } from "./contract-event";
import { ContractMethod } from "./contract-method";

export type MessageType = "text" | "button" | "event" | "method";

export interface MessageModel {
  chatId: string;
  from: string | Moralis.User;
  message: string | string[] | ContractMethod[] | ContractEvent;
  message_type: MessageType;
  link?: string;
}

export interface MessageMoralisEntity extends MessageModel {
  id: string;
  created_at: string;
}
