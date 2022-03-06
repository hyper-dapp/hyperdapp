import React, { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { InputText } from "primereact/inputtext";
import { IActionFormData } from "../forms/ActionForm";
import ActionsListForm from "../forms/ActionsListForm";
import ConditionsListForm from "../forms/ConditionsListForm";

interface IBooleanData {
  name: string;
  actions: IActionFormData[];
  conditions: string[][];
  onChange(value: Partial<IBooleanData>): void;
}

export default memo(({ data }: { data: IBooleanData }) => {
  const { name, actions, conditions, onChange } = data;

  return (
    <>
      <Handle
        id="boolean"
        type="target"
        position={Position.Top}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          top: "-9px",
        }}
        onConnect={(params) => console.log("handle onConnect", params)}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-bold">Block Name</p>
          <InputText
            className="block"
            placeholder="is_owner"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-4">
          <ActionsListForm
            actions={actions}
            onChange={(actions) => onChange({ actions })}
          />
        </div>
        <div className="flex flex-col gap-4">
          <ConditionsListForm
            conditions={conditions}
            onChange={(conditions) => onChange({ conditions })}
          />
        </div>
      </div>
      <Handle
        id="boolean:true"
        type="source"
        position={Position.Bottom}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          left: "30%",
          bottom: "-9px",
        }}
      />
      <Handle
        id="boolean:false"
        type="source"
        position={Position.Bottom}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          left: "70%",
          bottom: "-9px",
        }}
      />
    </>
  );
});
