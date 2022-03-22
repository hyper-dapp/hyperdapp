import React, { ReactChild } from "react";
import {
  ButtonPrompt,
  ColPrompt,
  LogPrompt,
  RowPrompt,
  TextPrompt,
} from "../../components";
import { Prompt, PromptEnum } from "../../types/prompt.types";
import { RenderPromptsParams } from "./renderPrompts.types";
import { ButtonArgs } from "../../components/ButtonPrompt/ButtonPrompts.types";
import InputPrompt from "../../components/InputPrompt";
import { InputArgs } from "../../components/InputPrompt/InputPrompt.types";
import { LogArgs } from "../../components/LogPrompt/LogPrompt.types";

export function renderPrompts(params: RenderPromptsParams): ReactChild[] {
  const filtered = params.prompts.filter((p): p is Prompt => {
    const keep = typeof p !== "string";
    if (!keep) {
      console.warn(`[prompt/render] Ignoring prompt string:`, p);
    }
    return keep;
  });

  return filtered.map(([type, ...args]) => {
    const { className, flow, isLatest, executeBtnAction, onInputChange } =
      params;

    switch (type) {
      case PromptEnum.COL:
        return (
          <ColPrompt className={className}>
            {renderPrompts({ ...params, prompts: args }).map((prompt) => (
              <div className="flex flex-1 items-center justify-center">
                {prompt}
              </div>
            ))}
          </ColPrompt>
        );
      case PromptEnum.ROW:
        return (
          <RowPrompt className={className}>
            {renderPrompts({ ...params, prompts: args }).map((prompt) => (
              <div className="flex flex-1 items-center justify-center">
                {prompt}
              </div>
            ))}
          </RowPrompt>
        );
      case PromptEnum.LOG:
        const [, logTerm] = args;
        return (
          <LogPrompt args={args as LogArgs}>
            {renderPrompts({ ...params, prompts: [logTerm] })}
          </LogPrompt>
        );
      case PromptEnum.BUTTON:
        return (
          <ButtonPrompt
            args={args as ButtonArgs}
            className={className}
            isLatest={isLatest}
            executeBtnAction={executeBtnAction}
          />
        );
      case PromptEnum.INPUT:
        return (
          <InputPrompt
            args={args as InputArgs}
            className={className}
            flow={flow}
            isLatest={isLatest}
            onInputChange={onInputChange}
          />
        );
      case PromptEnum.TEXT:
        return <TextPrompt className={className} args={args} />;
      case PromptEnum.DEBUG:
        console.log(`[prompt/debug]`, ...args);
        return <></>;
      default:
        console.warn(`[prompt/unrecognized-type]`, type, args);
        return <div className={className}>Unrecognized type: {type}</div>;
    }
  });
}
