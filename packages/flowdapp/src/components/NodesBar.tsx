import { v4 as uuidv4 } from "uuid";
import { FlowElement } from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setElementData, setElementsState } from "../store/slices/flow";

enum ElementType {
  LOAD_ABI = "loadAbi",
  PROMPT = "prompt",
  BOOLEAN = "boolean",
}

const NodesBar = () => {
  const { elements } = useAppSelector((store) => store.flow);
  const dispatch = useAppDispatch();

  const onChange = (id: string, data: any) => {
    dispatch(setElementData({ id, data }));
  };

  const setElementByType = (type: ElementType) => {
    let element: FlowElement;

    const id = uuidv4();
    const position = { x: 250, y: 25 };
    const style = {
      border: "1px solid black",
      padding: 16,
    };

    switch (type) {
      case ElementType.LOAD_ABI:
        element = {
          id,
          position,
          style: { ...style, backgroundColor: "#FFFFFF" },
          type: "loadAbiNode",
          data: {
            value: "",
            onChange: (data: any) => onChange(id, data),
          },
        };
        break;
      case ElementType.PROMPT:
        element = {
          id,
          position,
          style: { ...style, backgroundColor: "#DAE8FC" },
          type: "promptNode",
          data: {
            content: "",
            displayedText: "",
            actions: [],
            onChange: (data: any) => onChange(id, data),
          },
        };
        break;
      case ElementType.BOOLEAN:
        element = {
          id,
          position,
          style: { ...style, backgroundColor: "#D5E8D4" },
          type: "booleanNode",
          data: {
            name: "",
            actions: [],
            conditions: [],
            onChange: (data: any) => onChange(id, data),
          },
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
        label="Prompt"
        onClick={() => setElementByType(ElementType.PROMPT)}
      />
      <Button
        className="p-button-outlined p-button-secondary"
        label="Boolean"
        onClick={() => setElementByType(ElementType.BOOLEAN)}
      />
    </div>
  );
};

export default NodesBar;
