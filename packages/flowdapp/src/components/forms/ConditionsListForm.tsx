import React from "react";
import { Button } from "primereact/button";
import ConditionForm from "./ConditionForm";

interface IConditionsListFormProps {
  conditions: string[][];
  onChange(value: string[][]): void;
}

const ConditionsListForm = (props: IConditionsListFormProps) => {
  const { conditions, onChange } = props;

  return (
    <>
      {conditions.map((condition, index: number) => {
        return (
          <div
            className="relative rounded-md px-5 py-7 bg-gray-200 border border-gray-500"
            key={index}
          >
            <div
              className="absolute right-2 top-2"
              onClick={() => {
                const newConditions = [...conditions];
                newConditions.splice(index, 1);
                onChange(newConditions);
              }}
            >
              <i className="pi pi-times text-red-500 cursor-pointer" />
            </div>
            <ConditionForm
              condition={condition}
              onChange={(condition) => {
                const newConditions = [...conditions];
                newConditions[index] = condition;
                onChange(newConditions);
              }}
            />
          </div>
        );
      })}
      <Button
        icon="pi pi-plus"
        label="Add Condition"
        onClick={() => {
          const newCondition = new Array<string>(3);
          newCondition.fill("");
          onChange([...conditions, newCondition]);
        }}
      />
    </>
  );
};

export default ConditionsListForm;
