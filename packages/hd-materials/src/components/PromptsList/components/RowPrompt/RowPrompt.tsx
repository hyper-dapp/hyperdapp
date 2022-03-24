import React, { FC } from "react";
import { RowPromptProps } from "./RowPrompt.types";

const RowPrompt: FC<RowPromptProps> = ({ className, children }) => {
  return (
    <div className={`flex flex-row space-x-4 ${className}`}>{children}</div>
  );
};

export default RowPrompt;
