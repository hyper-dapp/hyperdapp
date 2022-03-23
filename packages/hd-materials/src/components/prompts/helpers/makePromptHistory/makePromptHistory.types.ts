import { Prompt } from "../../types/prompt.types";

export interface MakePromptHistoryApi {
  get length(): number;
  all(): Prompt[][];
  log(): void;
  init(flow: any): Promise<void>;
  execute(action: Prompt[]): Promise<void>;
  handleInput(acceptedValue: any): Promise<void>;
}
