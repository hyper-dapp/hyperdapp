import React, { FC } from "react";
import { ColPromptProps } from "./ColPrompt.types";

const ColPrompt: FC<ColPromptProps> = ({ className, children }) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>{children}</div>
  );
};

export default ColPrompt;
