import { v4 as uuidv4 } from "uuid";
import { FlowElement } from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../store/store";
import { ElementType, setElementsData } from "../store/slices/flow";
import FunctionInputsForm from "./forms/FunctionInputsForm";
import DropdownElement from "./elements/DropdownElement";
import DropdownGroupElement from "./elements/DropdownGroupElement";
import MultiSelectElement from "./elements/MultiSelectElement";
import TextAreaElement from "./elements/TextAreaElement";
import TextElement from "./elements/TextElement";

const SideBar = () => {
  const contracts = useAppSelector((store) => store.contracts);
  const { elements } = useAppSelector((store) => store.flow);
  const dispatch = useAppDispatch();

  const setElementByType = (type: ElementType) => {
    let element: FlowElement;
    const id = uuidv4();

    switch (type) {
      case "loadABI":
        const addressesDropdown = Object.keys(contracts).map((address) => ({
          label: address,
          value: address,
        }));

        element = {
          id,
          type: "input",
          position: { x: 250, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <MultiSelectElement
                id={id}
                label="Load Contract ABIs"
                items={addressesDropdown}
                fieldName="loadAbi"
              />
            ),
          },
        };
        break;
      case "predicate":
        element = {
          id,
          type: "input",
          position: { x: 150, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <TextElement
                id={id}
                label="Predicate Name"
                fieldName="predicate_name"
              />
            ),
          },
        };
        break;
      case "getData":
        const dropdownItems = [
          { label: "Connected Address", value: "me/address" },
        ];

        element = {
          id,
          type: "default",
          position: { x: 150, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <div className="flex flex-col gap-2">
                <DropdownElement
                  id={id}
                  label="Get Data"
                  items={dropdownItems}
                  fieldName="params"
                />
                <TextElement
                  id={id}
                  label="Output Variable"
                  fieldName="output"
                />
              </div>
            ),
          },
        };
        break;
      case "callFn":
        const viewDropdown = Object.keys(contracts).map((address) => {
          const items = contracts[address].methods.view.map((method) => {
            const { name } = method;
            return {
              label: name as string,
              value: [address, [name]],
            };
          });
          return { label: address, items };
        });

        element = {
          id,
          type: "default",
          position: { x: 250, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <div className="flex flex-col gap-2">
                <DropdownGroupElement
                  id={id}
                  label="Call View Methods"
                  items={viewDropdown}
                  fieldName="params"
                />
                <FunctionInputsForm id={id} />
                <TextElement
                  id={id}
                  label="Output Variable"
                  fieldName="output"
                />
              </div>
            ),
          },
        };
        break;
      case "nonPayableMethods":
        const nonPayableDropdown = Object.keys(contracts).map((address) => {
          const items = contracts[address].methods.nonPayable.map((method) => ({
            label: method.name as string,
            value: { [address]: method.name },
          }));
          return { label: address, items };
        });

        element = {
          id,
          type: "default",
          position: { x: 250, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <DropdownGroupElement
                id={id}
                label="Execute Non Payable Methods"
                items={nonPayableDropdown}
                fieldName=""
              />
            ),
          },
        };
        break;
      case "payableMethods":
        const payableDropdown = Object.keys(contracts).map((address) => {
          const items = contracts[address].methods.payable.map((method) => ({
            label: method.name as string,
            value: { [address]: method.name },
          }));
          return { label: address, items };
        });

        element = {
          id,
          type: "default",
          position: { x: 250, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <DropdownGroupElement
                id={id}
                label="Execute Payable Methods"
                items={payableDropdown}
                fieldName=""
              />
            ),
          },
        };
        break;
      case "displayBtn":
        element = {
          id,
          type: "default",
          position: { x: 250, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <TextAreaElement id={id} label="Display Button" fieldName="" />
            ),
          },
        };
        break;
      case "displayText":
        element = {
          id,
          type: "output",
          position: { x: 250, y: 25 },
          style: { width: 300 },
          data: {
            label: (
              <TextAreaElement id={id} label="Display Text" fieldName="" />
            ),
          },
        };
        break;
    }

    dispatch(
      setElementsData({
        id,
        type,
        elements: elements.concat(element),
      })
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="p-button-outlined p-button-secondary"
        label="Load Contract ABI"
        onClick={() => setElementByType("loadABI")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="New Predicate"
        onClick={() => setElementByType("predicate")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Get Data"
        onClick={() => setElementByType("getData")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Call View Method"
        onClick={() => setElementByType("callFn")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Execute Non Payable Method"
        onClick={() => setElementByType("nonPayableMethods")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Execute Payable Method"
        onClick={() => setElementByType("payableMethods")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Display Button"
        onClick={() => setElementByType("displayBtn")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Display Text"
        onClick={() => setElementByType("displayText")}
      />
    </div>
  );
};

export default SideBar;
