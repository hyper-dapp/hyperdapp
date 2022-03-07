import React, { FC, memo } from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import ActionForm, { IActionFormData } from "../forms/ActionForm";

interface ISingleActionData extends IActionFormData {
  onChange(value: Partial<ISingleActionData>): void;
}

const TriggerActionNode: FC<NodeProps> = ({
  data,
}: {
  data: ISingleActionData;
}) => {
  const { onChange, ...action } = data;

  return (
    <>
      <Handle
        id="triggerAction"
        type="target"
        position={Position.Top}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          top: "-9px",
        }}
      />
      <ActionForm
        action={action}
        onChange={(data) => {
          const newAction = { ...action, ...data };
          onChange(newAction);
        }}
      />
      <Handle
        id={`triggerAction:${data.type}`}
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

export default memo(TriggerActionNode);
