import { v4 as uuidv4 } from "uuid";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  removeElements,
  updateEdge,
} from "react-flow-renderer";
import { useMoralis } from "react-moralis";
import { ToastContainer } from "react-toastify";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "./store/store";
import { setElementsState } from "./store/slices/flow";
import LoadAbiNode from "./components/custom-nodes/LoadAbiNode";
import PromptNode from "./components/custom-nodes/PromptNode";
import BooleanNode from "./components/custom-nodes/BooleanNode";
import LoadAbiForm from "./components/forms/LoadAbiForm";
import NodesBar from "./components/NodesBar";
import Navbar from "./components/NavBar/Navbar";
import Loader from "./components/Loader";

const nodeTypes = {
  loadAbiNode: LoadAbiNode,
  promptNode: PromptNode,
  booleanNode: BooleanNode,
};

const App = () => {
  const { isWeb3Enabled, isWeb3EnableLoading, enableWeb3 } = useMoralis();
  const contracts = useAppSelector((store) => store.contracts);
  const { elements } = useAppSelector((store) => store.flow);
  const [rfInstance, setRfInstance] = useState<any>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3();
    }
  }, [isWeb3Enabled, isWeb3EnableLoading, enableWeb3]);

  const onLoad = useCallback(
    (rfi) => {
      if (!rfInstance) {
        setRfInstance(rfi);
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
      let newEdge = {
        ...params,
        id,
        animated: true,
        style: { stroke: "#555" },
      };
      if (params.sourceHandle === "boolean:true") {
        newEdge = {
          ...newEdge,
          label: "True",
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "#D5E8D4", color: "#fff" },
          arrowHeadType: "arrowclosed",
        };
      } else if (params.sourceHandle === "boolean:false") {
        newEdge = {
          ...newEdge,
          label: "False",
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "#FFB570", color: "#fff" },
          arrowHeadType: "arrowclosed",
        };
      }
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
    <div className="flex flex-col h-screen w-full">
      {!isWeb3Enabled && <Loader />}
      {isWeb3Enabled && (
        <Fragment>
          <Navbar />
          <div className="container mx-auto p-10 h-full">
            <div className="flex flex-col flex-auto gap-6 h-full">
              <LoadAbiForm />
              {Object.keys(contracts).length > 0 && (
                <div className="flex flex-row justify-between">
                  <NodesBar />
                  <Button
                    className="p-button-success"
                    label="Save"
                    onClick={onSave}
                  />
                </div>
              )}
              <div className="flex flex-col flex-auto h-full border-2 border-black">
                <ReactFlow
                  elements={elements}
                  nodeTypes={nodeTypes}
                  onElementsRemove={onElementsRemove}
                  onEdgeUpdate={onEdgeUpdate}
                  onConnect={onConnect}
                  onLoad={onLoad}
                  panOnScroll={true}
                >
                  <Controls />
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={36}
                    size={0.5}
                  />
                </ReactFlow>
              </div>
            </div>
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Fragment>
      )}
    </div>
  );
};

export default App;
