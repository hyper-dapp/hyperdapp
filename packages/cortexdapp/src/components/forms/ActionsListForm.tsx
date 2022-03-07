import React from "react";
import { Button } from "primereact/button";
import ActionForm, { ActionTypes, IActionFormData } from "./ActionForm";

interface IActionsListFormProps {
  actions: IActionFormData[];
  onChange(value: IActionFormData[]): void;
}

const ActionsListForm = (props: IActionsListFormProps) => {
  const { actions, onChange } = props;

  return (
    <>
      {actions.map((action: IActionFormData, index: number) => (
        <div
          className="relative rounded-md px-5 py-7 bg-gray-200 border border-gray-500"
          key={index}
        >
          <div
            className="absolute right-2 top-2"
            onClick={() => {
              const newActions = [...actions];
              newActions.splice(index, 1);
              onChange(newActions);
            }}
          >
            <i className="pi pi-times text-red-500 cursor-pointer" />
          </div>
          <ActionForm
            action={action}
            onChange={(data) => {
              const newActions = [...actions];
              newActions[index] = data;
              onChange(newActions);
            }}
          />
        </div>
      ))}
      <Button
        icon="pi pi-plus"
        label="Add Action"
        onClick={() => {
          const newAction = { type: "" as ActionTypes, inputs: [] };
          onChange([...actions, newAction]);
        }}
      />
    </>
  );
};

export default ActionsListForm;
