import { v4 as uuidv4 } from "uuid";
import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Controls,
  removeElements,
  updateEdge,
} from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "./store/store";
import { setElementsState } from "./store/slices/flow";
import LoadAbiNode from "./components/custom-nodes/LoadAbiNode";
import PromptNode from "./components/custom-nodes/PromptNode";
import BooleanNode from "./components/custom-nodes/BooleanNode";
import LoadAbiForm from "./components/forms/LoadAbiForm";
import NodesBar from "./components/NodesBar";

const nodeTypes = {
  loadAbiNode: LoadAbiNode,
  promptNode: PromptNode,
  booleanNode: BooleanNode,
};

const App = () => {
  const contracts = useAppSelector((store) => store.contracts);
  const { elements } = useAppSelector((store) => store.flow);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const dispatch = useAppDispatch();

  const onLoad = useCallback(
    (rfi) => {
      if (!rfInstance) {
        setRfInstance(rfi);
        console.log("flow loaded:", rfi);
      }
    },
    [rfInstance]
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.log(flow);
    }
  }, [rfInstance]);

  const onConnect = useCallback(
    (params: any) => {
      const id = uuidv4();
      const newEdge = {
        ...params,
        id,
        animated: true,
        style: { stroke: "#555" },
      };
      dispatch(setElementsState(addEdge(newEdge, elements)));
    },
    [elements, dispatch]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: any, newConnection: any) => {
      dispatch(setElementsState(updateEdge(oldEdge, newConnection, elements)));
    },
    [elements, dispatch]
  );

  const onElementsRemove = useCallback(
    (elementsToRemove: any) => {
      dispatch(setElementsState(removeElements(elementsToRemove, elements)));
    },
    [elements, dispatch]
  );

  return (
    <div className="container mx-auto p-10 h-screen">
      <div className="flex flex-col gap-6 h-full">
        <LoadAbiForm />
        {Object.keys(contracts).length > 0 && (
          <div className="flex flex-row justify-between	">
            <NodesBar />
            <Button
              className="p-button-success"
              label="Save"
              onClick={onSave}
            />
          </div>
        )}
        <div className="border-2 border-black h-full">
          <ReactFlow
            elements={elements}
            nodeTypes={nodeTypes}
            onElementsRemove={onElementsRemove}
            onEdgeUpdate={onEdgeUpdate}
            onConnect={onConnect}
            onLoad={onLoad}
            deleteKeyCode={46}
          >
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default App;
