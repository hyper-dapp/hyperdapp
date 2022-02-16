import { v4 as uuidv4 } from "uuid";
import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  removeElements,
  updateEdge,
} from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "./store/store";
import { saveFlow, setEdgesData, setElementsState } from "./store/slices/flow";
import AddContractForm from "./components/AddContractForm";
import SideBar from "./components/SideBar";

const App = () => {
  const { elements, data } = useAppSelector((store) => store.flow);
  const contracts = useAppSelector((store) => store.contracts);
  const [rfInstance, setRfInstance] = useState<any>();
  const dispatch = useAppDispatch();

  const onConnect = (params: any) => {
    const id = uuidv4();
    const newEdge = { id, ...params };
    dispatch(setElementsState(addEdge(newEdge, elements)));
    dispatch(setEdgesData({ id, edge: newEdge }));
  };

  const onEdgeUpdate = (oldEdge: any, newConnection: any) =>
    dispatch(setElementsState(updateEdge(oldEdge, newConnection, elements)));

  const onElementsRemove = (elementsToRemove: any) =>
    dispatch(setElementsState(removeElements(elementsToRemove, elements)));

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.log(flow);
      dispatch(saveFlow(data));
    }
  }, [rfInstance, data, dispatch]);

  return (
    <div className="flex flex-col items-center gap-10 p-10">
      <div className="flex flex-row gap-6 w-full">
        <AddContractForm />
        <div className="flex flex-col gap-4 w-1/2">
          <div className="border-2 border-black" style={{ height: 500 }}>
            <ReactFlow
              elements={elements}
              onElementsRemove={onElementsRemove}
              onEdgeUpdate={onEdgeUpdate}
              onConnect={onConnect}
              onLoad={setRfInstance}
              deleteKeyCode={46}
            />
          </div>
          <Button className="p-button-success" label="Save" onClick={onSave} />
        </div>
        {Object.keys(contracts).length > 0 && <SideBar />}
      </div>
    </div>
  );
};

export default App;
