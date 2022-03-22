import { Prompt } from "../../types/prompt.types";

export type ButtonAttrs = {
  enabled?: boolean;
};

export type ButtonArgs = [string, ButtonAttrs, Prompt[]];

export interface ButtonPromptsProps {
  args: ButtonArgs;
  className: string;
  isLatest: boolean;
  executeBtnAction(action: any[]): void;
}
