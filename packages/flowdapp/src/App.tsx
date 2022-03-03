import { v4 as uuidv4 } from "uuid";
import React, { useCallback, useEffect, useState } from "react";
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
import AddContractForm from "./components/AddContractForm";
import SideBar from "./components/SideBar";

const nodeTypes = {
  promptNode: PromptNode,
  abiNode: LoadAbiNode,
};

const App = () => {
  const contracts = useAppSelector((store) => store.contracts);
  const { elements } = useAppSelector((store) => store.flow);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (rfInstance && elements.length > 0) {
      rfInstance.fitView();
    }
  }, [rfInstance, elements.length]);

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
    <div className="flex flex-col items-center gap-10 p-10">
      <div className="flex flex-row gap-6 w-full">
        <AddContractForm />
        <div className="flex flex-col gap-4 w-1/2">
          <div className="border-2 border-black" style={{ height: 500 }}>
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
          <Button className="p-button-success" label="Save" onClick={onSave} />
        </div>
        {Object.keys(contracts).length > 0 && <SideBar />}
      </div>
    </div>
  );
};

export default App;
