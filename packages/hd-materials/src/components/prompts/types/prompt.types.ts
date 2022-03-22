export enum PromptEnum {
  COL = "col",
  ROW = "row",
  BUTTON = "button",
  TEXT = "text",
  INPUT = "input",
  LOG = "log",
  DEBUG = "debug",
}

export type Prompt = [PromptEnum, ...PromptArg[]];
export type PromptArg = Prompt | string | object;
