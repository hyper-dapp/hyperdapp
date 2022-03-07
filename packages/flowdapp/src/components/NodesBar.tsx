import { v4 as uuidv4 } from "uuid";
import { FlowElement } from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setElementData, setElementsState } from "../store/slices/flow";

enum ElementType {
  LOAD_ABI = "loadAbi",
  BOOLEAN = "boolean",
  TRIGGER_ACTION = "triggerAction",
  PROMPT = "prompt",
}

const NodesBar = () => {
  const { elements } = useAppSelector((store) => store.flow);
  const dispatch = useAppDispatch();

  const onChange = (id: string, data: any) => {
    dispatch(setElementData({ id, data }));
  };

  const setElementByType = (type: ElementType) => {
    const id = uuidv4();
    const element: FlowElement = {
      id,
      position: { x: 250, y: 25 },
      style: {
        border: "1px solid black",
        padding: 16,
      },
      data: {
        onChange: (data: any) => onChange(id, data),
      },
    };

    switch (type) {
      case ElementType.LOAD_ABI:
        element.type = "loadAbiNode";
        element.style = { ...element.style, backgroundColor: "#FFFFFF" };
        element.data = { ...element.data, value: "" };
        break;
      case ElementType.BOOLEAN:
        element.type = "booleanNode";
        element.style = { ...element.style, backgroundColor: "#D5E8D4" };
        element.data = {
          ...element.data,
          name: "",
          actions: [],
          conditions: [],
        };
        break;
      case ElementType.TRIGGER_ACTION:
        element.type = "triggerActionNode";
        element.style = { ...element.style, backgroundColor: "#FFFFFF" };
        element.data = {
          ...element.data,
          type: "",
          inputs: [],
        };
        break;
      case ElementType.PROMPT:
        element.type = "promptNode";
        element.style = { ...element.style, backgroundColor: "#DAE8FC" };
        element.data = {
          ...element.data,
          content: "",
          displayedText: "",
          actions: [],
        };
        break;
    }

    dispatch(setElementsState(elements.concat(element)));
  };

  return (
    <div className="flex flex-row gap-2">
      <Button
        className="p-button-outlined p-button-secondary"
        label="Load ABI"
        onClick={() => setElementByType(ElementType.LOAD_ABI)}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Boolean"
        onClick={() => setElementByType(ElementType.BOOLEAN)}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Trigger Action"
        onClick={() => setElementByType(ElementType.TRIGGER_ACTION)}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Prompt"
        onClick={() => setElementByType(ElementType.PROMPT)}
      />
    </div>
  );
};

export default NodesBar;
