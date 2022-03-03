import { v4 as uuidv4 } from "uuid";
import { FlowElement } from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  ElementType,
  setElementData,
  setElementsState,
} from "../store/slices/flow";

const SideBar = () => {
  const { elements } = useAppSelector((store) => store.flow);
  const dispatch = useAppDispatch();

  const onChange = (id: string, data: any) => {
    dispatch(setElementData({ id, data }));
  };

  const setElementByType = (type: ElementType) => {
    let element: FlowElement;
    const id = uuidv4();

    switch (type) {
      case "loadABI":
        element = {
          id,
          type: "abiNode",
          position: { x: 250, y: 25 },
          style: {
            border: "1px solid black",
            backgroundColor: "#FFFFFF",
            padding: 16,
          },
          data: {
            value: "",
            onChange: (data: any) => onChange(id, data),
          },
        };
        break;
      case "prompt":
        element = {
          id,
          type: "promptNode",
          position: { x: 250, y: 25 },
          style: {
            border: "1px solid black",
            backgroundColor: "#DAE8FC",
            padding: 16,
          },
          data: {
            content: "",
            displayedText: "",
            actions: [],
            onChange: (data: any) => onChange(id, data),
          },
        };
        break;
    }

    dispatch(setElementsState(elements.concat(element)));
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="p-button-outlined p-button-secondary"
        label="Load ABI"
        onClick={() => setElementByType("loadABI")}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Prompt"
        onClick={() => setElementByType("prompt")}
      />
    </div>
  );
};

export default SideBar;
