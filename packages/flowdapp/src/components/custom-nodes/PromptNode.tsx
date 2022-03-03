import React, { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { IActionFormData } from "../forms/ActionForm";
import ActionsListForm from "../forms/ActionsListForm";

const promptItems = [
  {
    label: "Button",
    value: "button",
  },
  {
    label: "Text",
    value: "text",
  },
];

interface IPromptData {
  content: "button" | "text";
  displayedText: string;
  actions: IActionFormData[];
  onChange(value: Partial<IPromptData>): void;
}

export default memo(({ data }: { data: IPromptData }) => {
  const { content, displayedText, actions, onChange } = data;

  const buttonPrompt = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold">Button Text</p>
        <InputText
          className="block"
          placeholder="E.g. Mint"
          value={displayedText}
          onChange={(e) => onChange({ displayedText: e.target.value })}
        />
      </div>
      <ActionsListForm
        actions={actions}
        onChange={(actions) => onChange({ actions })}
      />
    </div>
  );

  const textPrompt = (
    <div className="flex flex-col gap-1">
      <p className="font-bold">Displayed Text</p>
      <InputText
        className="block"
        placeholder="E.g. Welcome to HyperDapp!"
        value={displayedText}
        onChange={(e) => onChange({ displayedText: e.target.value })}
      />
    </div>
  );

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          left: "-9px",
        }}
        onConnect={(params) => console.log("handle onConnect", params)}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-bold">What do you want to prompt?</p>
          <Dropdown
            value={content}
            options={promptItems}
            onChange={(e) => onChange({ content: e.value })}
            optionLabel="label"
            placeholder="Choose"
          />
        </div>
        {content === "button" && buttonPrompt}
        {content === "text" && textPrompt}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          right: "-9px",
        }}
        onConnect={(params) => console.log("handle onConnect", params)}
      />
    </>
  );
});
