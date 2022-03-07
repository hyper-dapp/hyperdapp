import React from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

interface IConditionFormProps {
  condition: string[];
  onChange(value: string[]): void;
}

const operatorItems = [
  {
    label: "=",
    value: "equal",
  },
  {
    label: ">",
    value: "greater",
  },
  {
    label: "<",
    value: "lower",
  },
];

const ConditionForm = ({ condition, onChange }: IConditionFormProps) => {
  const [rightSide, operator, leftSide] = condition;

  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold">Left-Hand side</p>
        <InputText
          placeholder="Left-hand side"
          value={rightSide}
          onChange={(e) => {
            const newCondition = [...condition];
            newCondition[0] = e.target.value;
            onChange(newCondition);
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-bold">Operator</p>
        <Dropdown
          value={operator}
          options={operatorItems}
          onChange={(e) => {
            const newCondition = [...condition];
            newCondition[1] = e.value;
            onChange(newCondition);
          }}
          optionLabel="label"
          placeholder="Choose Action"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-bold">Right-Hand side</p>
        <InputText
          placeholder="Right-hand side"
          value={leftSide}
          onChange={(e) => {
            const newCondition = [...condition];
            newCondition[2] = e.target.value;
            onChange(newCondition);
          }}
        />
      </div>
    </div>
  );
};

export default ConditionForm;
