import React, { FC } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputPromptProps, InputTypeEnum } from "./InputPrompt.types";

const VALID_INPUT_TYPES = ["address", "eth", "text"];

const InputPrompt: FC<InputPromptProps> = ({
  args,
  className,
  flow,
  isLatest,
  onInputChange,
}) => {
  const [inputType, name] = args;

  if (!VALID_INPUT_TYPES.includes(inputType)) {
    return (
      <div className={className}>Unrecognized type: input / {inputType}</div>
    );
  }

  const onInput = async (e: any) => {
    const accepted = await flow.handleInput(name, e.target.value);
    if (accepted) onInputChange(accepted.value);
  };

  switch (inputType) {
    case InputTypeEnum.ADDRESS:
      return (
        <InputText placeholder="0x..." onInput={onInput} disabled={!isLatest} />
      );
    case InputTypeEnum.ETH:
      return (
        <InputText placeholder="0.01" onInput={onInput} disabled={!isLatest} />
      );
    case InputTypeEnum.TEXT:
      return (
        <InputTextarea
          placeholder="Enter text here"
          onInput={onInput}
          disabled={!isLatest}
        />
      );
  }
};

export default InputPrompt;
