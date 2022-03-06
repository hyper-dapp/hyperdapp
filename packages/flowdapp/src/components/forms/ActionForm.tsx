import React, { useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { TreeSelect } from "primereact/treeselect";
import TreeNode from "primereact/treenode";
import { useAppSelector } from "../../store/store";

export type ActionTypes = "call_fn" | "get_ctx" | "set_ctx";

export interface IActionFormData {
  type: ActionTypes;
  inputs: string[];
  output?: string;
  callFn?: string;
}

interface IActionFormProps {
  action: IActionFormData;
  onChange(value: IActionFormData): void;
}

const actionItems = [
  {
    label: "Call ABI Function",
    value: "call_fn",
  },
  {
    label: "Get Context State",
    value: "get_ctx",
  },
  {
    label: "Set Context State",
    value: "set_ctx",
  },
];

const ActionForm = (props: IActionFormProps) => {
  const contracts = useAppSelector((store) => store.contracts);

  const callFnItems = useMemo(() => {
    return Object.keys(contracts).map((address) => {
      const view: TreeNode[] = [];
      const payable: TreeNode[] = [];
      const nonPayable: TreeNode[] = [];

      contracts[address].methods.arr
        .filter((m) => m.type === "function")
        .forEach((fn: any) => {
          const item: TreeNode = {
            key: "",
            label: fn.name,
            selectable: true,
          };
          if (fn.stateMutability === "view") {
            item.key = `${address},${fn.name}`;
            view.push(item);
          }
          if (fn.stateMutability === "payable") {
            item.key = `${address},${fn.name}`;
            payable.push(item);
          }
          if (fn.stateMutability === "nonpayable") {
            item.key = `${address},${fn.name}`;
            nonPayable.push(item);
          }
        });

      return {
        key: address,
        label: address,
        selectable: false,
        children: [
          {
            key: "read",
            label: "Read",
            selectable: false,
            children: view,
          },
          {
            key: "write",
            label: "Write",
            selectable: false,
            children: [
              {
                key: `payable`,
                label: "Payable",
                selectable: false,
                children: payable,
              },
              {
                key: `nonpayable`,
                label: "Non Payable",
                selectable: false,
                children: nonPayable,
              },
            ],
          },
        ],
      };
    });
  }, [contracts]);

  const fnForm = (callFn: string) => {
    const [address, name] = callFn.split(",");
    const method = contracts[address].methods.map[name];
    const inputsLength =
      method.stateMutability === "payable"
        ? method.inputs.length + 1
        : method.inputs.length;

    return (
      <>
        {method.inputs.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Inputs</p>
            {method.inputs.map((input, index) => {
              const { name, type } = input;
              return (
                <div className="flex flex-col gap-1" key={index}>
                  <InputText
                    className="block"
                    placeholder={`${name}::${type}`}
                    value={props.action.inputs[index]}
                    onChange={(e) => {
                      const inputs = [...props.action.inputs];
                      inputs[index] = e.target.value;
                      props.onChange({ ...props.action, inputs });
                    }}
                  />
                </div>
              );
            })}
            {method.stateMutability === "payable" && (
              <div className="flex flex-col gap-1">
                <InputText
                  className="block"
                  placeholder={`value::eth`}
                  value={props.action.inputs[inputsLength - 1]}
                  onChange={(e) => {
                    const inputs = [...props.action.inputs];
                    inputs[inputsLength - 1] = e.target.value;
                    props.onChange({ ...props.action, inputs });
                  }}
                />
              </div>
            )}
          </div>
        )}
        {method.outputs.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Output</p>
            <InputText
              className="block"
              placeholder={`output::${method.outputs[0].type}`}
              value={props.action.output}
              onChange={(e) =>
                props.onChange({ ...props.action, output: e.target.value })
              }
            />
          </div>
        )}
      </>
    );
  };

  const ctxForm = (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold">Key</p>
        <InputText
          className="block"
          placeholder="Key"
          value={props.action.inputs[0]}
          onChange={(e) => {
            const inputs = [...props.action.inputs];
            inputs[0] = e.target.value;
            props.onChange({ ...props.action, inputs });
          }}
        />
      </div>
      {props.action.type === "get_ctx" && (
        <div className="flex flex-col gap-2">
          <p className="font-bold">Output</p>
          <InputText
            className="block"
            placeholder="Output"
            value={props.action.output}
            onChange={(e) =>
              props.onChange({ ...props.action, output: e.target.value })
            }
          />
        </div>
      )}
      {props.action.type === "set_ctx" && (
        <div className="flex flex-col gap-1">
          <p className="font-bold">Value</p>
          <InputText
            className="block"
            placeholder="Value"
            value={props.action.inputs[1]}
            onChange={(e) => {
              const inputs = [...props.action.inputs];
              inputs[1] = e.target.value;
              props.onChange({ ...props.action, inputs });
            }}
          />
        </div>
      )}
    </div>
  );

  const callFnForm = (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold">Function</p>
        <TreeSelect
          value={props.action.callFn}
          options={callFnItems}
          placeholder="Select Function"
          selectionMode="single"
          filterPlaceholder="Search..."
          resetFilterOnHide
          filter
          onChange={(e) => {
            const callFn = e.value as string;
            const [address, name] = callFn.split(",");
            const method = contracts[address].methods.map[name];
            const { stateMutability, inputs, outputs } = method;

            const inputsLength =
              stateMutability === "payable" ? inputs.length + 1 : inputs.length;

            props.onChange({
              ...props.action,
              callFn,
              inputs: new Array(inputsLength),
              ...(outputs.length > 0 && { output: "" }),
            });
          }}
        />
      </div>
      {props.action.callFn && fnForm(props.action.callFn)}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold">Action</p>
        <Dropdown
          value={props.action.type}
          options={actionItems}
          onChange={(e) => {
            const type = e.value;
            let inputsLength = 0;
            if (type === "get_ctx") inputsLength = 1;
            if (type === "set_ctx") inputsLength = 2;
            const inputsArr = new Array(inputsLength);
            inputsArr.fill("");
            props.onChange({
              ...props.action,
              type: e.value,
              inputs: inputsArr,
              ...(type === "get_ctx" && { output: "" }),
            });
          }}
          optionLabel="label"
          placeholder="Choose Action"
        />
      </div>
      {props.action.type === "call_fn" && callFnForm}
      {["get_ctx", "set_ctx"].includes(props.action.type) && ctxForm}
    </div>
  );
};

export default ActionForm;
