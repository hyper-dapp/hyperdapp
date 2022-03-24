import React from "react";
import { LogTypeEnum } from "../LogPrompt.types";

const SOLID_EXCLAMATION = (
  <path
    fillRule="evenodd"
    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
    clipRule="evenodd"
  />
);

const SOLID_INFORMATION_CIRCLE = (
  <path
    fillRule="evenodd"
    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
    clipRule="evenodd"
  />
);

const SOLID_X_CIRCLE = (
  <path
    fillRule="evenodd"
    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
    clipRule="evenodd"
  />
);

const SOLID_CHECK_CIRCLE = (
  <path
    fillRule="evenodd"
    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
    clipRule="evenodd"
  />
);

const renderIcon = (type: LogTypeEnum, className: string) => {
  return (
    <svg
      className={`h-5 w-5 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      {type === "error"
        ? SOLID_X_CIRCLE
        : type === "success"
        ? SOLID_CHECK_CIRCLE
        : type === "warning"
        ? SOLID_EXCLAMATION
        : SOLID_INFORMATION_CIRCLE}
    </svg>
  );
};

export const renderLog = (logType: LogTypeEnum, content: any) => {
  let styles: string[];

  switch (logType) {
    case LogTypeEnum.ERROR:
      styles = ["bg-red-50", "border-red-400", "text-red-700", "text-red-400"];
      break;
    case LogTypeEnum.SUCCESS:
      styles = [
        "bg-green-50",
        "border-green-400",
        "text-green-700",
        "text-green-400",
      ];
      break;
    case LogTypeEnum.WARNING:
      styles = [
        "bg-yellow-50",
        "border-yellow-400",
        "text-yellow-700",
        "text-yellow-400",
      ];
      break;
    default:
      styles = [
        "bg-blue-50",
        "border-blue-400",
        "text-blue-700",
        "text-blue-400",
      ];
      break;
  }

  const [bgColor, borderColor, textColor, iconColor] = styles;

  return (
    <div className={`p-4 border-l-4 ${bgColor} ${borderColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">{renderIcon(logType, iconColor)}</div>
        <div className="ml-3">
          <div className={`text-sm ${textColor}`}>{content}</div>
        </div>
      </div>
    </div>
  );
};
