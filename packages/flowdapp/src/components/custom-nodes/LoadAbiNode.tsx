import React, { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { MultiSelect } from "primereact/multiselect";
import { useAppSelector } from "../../store/store";

interface ILoadAbiData {
  value: string;
  onChange(value: Partial<ILoadAbiData>): void;
}

export default memo(({ data }: { data: ILoadAbiData }) => {
  const { value, onChange } = data;
  const contracts = useAppSelector((store) => store.contracts);
  const items = Object.keys(contracts).map((address) => ({
    label: address,
    value: address,
  }));

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="font-bold">Load Contract ABIs</p>
        <MultiSelect
          value={value}
          options={items}
          onChange={(e) => onChange({ value: e.value })}
          optionLabel="label"
          placeholder="Select addresses"
          display="chip"
        />
      </div>
      <Handle
        id="loadAbi"
        type="source"
        position={Position.Bottom}
        style={{
          background: "#555",
          height: "18px",
          width: "18px",
          bottom: "-9px",
        }}
        onConnect={(params) => console.log("handle onConnect", params)}
      />
    </>
  );
});
