import { FC, memo } from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
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

const PromptNode: FC<NodeProps> = ({ data }: { data: IPromptData }) => {
  const { content, displayedText, actions, onChange } = data;

  const buttonPrompt = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold">Button Text</p>
        <InputText
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
        placeholder="E.g. Welcome to HyperDapp!"
        value={displayedText}
        onChange={(e) => onChange({ displayedText: e.target.value })}
      />
    </div>
  );

  return (
    <>
      <Handle
        id="prompt"
        type="target"
        position={Position.Top}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          top: "-9px",
        }}
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
        id={`prompt:${data.content}`}
        type="source"
        position={Position.Bottom}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          bottom: "-9px",
        }}
      />
    </>
  );
};

export default memo(PromptNode);
