import { PromptArg } from "../../types/prompt.types";

export interface RenderPromptsParams {
  className: string;
  flow: any;
  isLatest: boolean;
  prompts: PromptArg[];
  executeBtnAction(action: any[]): void;
  onInputChange(acceptedValue: any): void;
}
