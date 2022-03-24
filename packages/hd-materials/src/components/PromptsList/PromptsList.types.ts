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

export type PromptLayout = "chat" | "divider";

export interface IPromptHistory {
  get length(): number;
  all(): Prompt[][];
  log(): void;
  reset(): void;
  init(flow: any): Promise<void>;
  execute(action: Prompt[]): Promise<void>;
  handleInput(acceptedValue: any): Promise<void>;
}

export interface RenderPromptsParams {
  className: string;
  flow: any;
  isLatest: boolean;
  prompts: PromptArg[];
  executeBtnAction(action: any[]): void;
  onInputChange(acceptedValue: any): void;
}

export interface PromptsListProps {
  address: string;
  flow: any;
  layout: PromptLayout;
}
