import { v4 as uuidv4 } from "uuid";
import { FlowElement } from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../store/store";
import { ElementType, setElementsData } from "../store/slices/flow";
import DropdownGroupElement from "./elements/DropdownGroupElement";
import MultiSelectElement from "./elements/MultiSelectElement";
import TextAreaElement from "./elements/TextAreaElement";

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
              />
            ),
          },
        };
        break;
      case "viewMethods":
        const viewDropdown = Object.keys(contracts).map((address) => {
          const items = contracts[address].methods.view.map((method) => ({
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
              <div className="flex flex-col gap-2">
                <DropdownGroupElement
                  id={id}
                  label="Call View Methods"
                  items={viewDropdown}
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
            label: <TextAreaElement id={id} label="Display Button" />,
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
            label: <TextAreaElement id={id} label="Display Text" />,
          },
        };
        break;
    }

    dispatch(
      setElementsData({
        elements: elements.concat(element),
        data: {
          id,
          type,
          value: undefined,
        },
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
        label="Call View Method"
        onClick={() => setElementByType("viewMethods")}
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
