export enum InputTypeEnum {
  ADDRESS = "address",
  ETH = "eth",
  TEXT = "text",
}

export type InputArgs = [InputTypeEnum, string];

export interface InputPromptProps {
  args: InputArgs;
  className: string;
  flow: any;
  isLatest: boolean;
  onInputChange(acceptedValue: any): void;
}
