import React, { FC } from "react";
import { renderLog } from "./helpers/renderLog";
import { LogPromptProps, LogTypeEnum } from "./LogPrompt.types";

const LogPrompt: FC<LogPromptProps> = ({ args, children }) => {
  let [logType, logTerm] = args;

  if (!Object.values(LogTypeEnum).includes(logType)) {
    console.warn(`[prompt/log/unrecognized-type]`, logType, logTerm);
    logType = LogTypeEnum.NOTICE;
  }

  return renderLog(logType, children);
};

export default LogPrompt;
