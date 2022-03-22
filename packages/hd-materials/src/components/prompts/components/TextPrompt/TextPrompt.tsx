import "./TextPrompt.css";
import { unescapeString } from "hyperdapp";
import React, { FC } from "react";
import { TextPromptProps } from "./TextPrompt.types";

const TextPrompt: FC<TextPromptProps> = ({ className, args }) => {
  return (
    <div className={`prompt__text ${className}`}>
      {args.map(unescapeString).join("")}
    </div>
  );
};

export default TextPrompt;
