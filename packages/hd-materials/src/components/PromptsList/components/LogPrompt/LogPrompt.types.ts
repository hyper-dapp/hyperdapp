import { Prompt } from "../../PromptsList.types";

export enum LogTypeEnum {
  ERROR = "error",
  NOTICE = "notice",
  SUCCESS = "success",
  WARNING = "warning",
}

export type LogArgs = [LogTypeEnum, Prompt];

export interface LogPromptProps {
  args: LogArgs;
}
