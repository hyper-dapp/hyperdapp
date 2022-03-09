import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  removeElements,
  updateEdge,
} from "react-flow-renderer";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { saveCortex, setElementsState } from "../../store/slices/cortex";
import NodesBar from "../../components/NodesBar";
import LoadAbiNode from "../../components/custom-nodes/LoadAbiNode";
import BooleanNode from "../../components/custom-nodes/BooleanNode";
import TriggerActionNode from "../../components/custom-nodes/TriggerActionNode";
import PromptNode from "../../components/custom-nodes/PromptNode";

const nodeTypes = {
  loadAbiNode: LoadAbiNode,
  booleanNode: BooleanNode,
  triggerActionNode: TriggerActionNode,
  promptNode: PromptNode,
};

const CortexEditor = () => {
  const { cortexId } = useParams();
  const elements = useAppSelector(
    (store) => store.cortex.elements[cortexId as string]
  );
  const contracts = useAppSelector((store) => store.contracts);
  const [rfInstance, setRfInstance] = useState<any>(null);

  const dispatch = useAppDispatch();
  const onLoad = useCallback(
    (rfi) => {
      debugger;
      if (!rfInstance) {
        setRfInstance(rfi);
      }
    },
    [rfInstance]
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      debugger;
      const elements = rfInstance.toObject();
      dispatch(saveCortex({ id: cortexId, elements }));
    }
  }, [cortexId, rfInstance, dispatch]);

  const onConnect = useCallback(
    (params: any) => {
      if (!cortexId) return;

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
      dispatch(
        setElementsState({ cortexId, elements: addEdge(newEdge, elements) })
      );
    },
    [cortexId, elements, dispatch]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: any, newConnection: any) => {
      if (!cortexId) return;

      dispatch(
        setElementsState({
          cortexId,
          elements: updateEdge(oldEdge, newConnection, elements),
        })
      );
    },
    [cortexId, elements, dispatch]
  );

  const onElementsRemove = useCallback(
    (elementsToRemove: any) => {
      if (!cortexId) return;

      dispatch(
        setElementsState({
          cortexId,
          elements: removeElements(elementsToRemove, elements),
        })
      );
    },
    [cortexId, elements, dispatch]
  );
  return (
    <div className="flex flex-col flex-auto gap-6 h-full">
      {Object.keys(contracts).length === 0 && (
        <p className="text-xl">
          No ABIs detected! You must load at least one ABI first!
        </p>
      )}
      {Object.keys(contracts).length > 0 && (
        <>
          <div className="flex flex-row justify-between">
            <NodesBar />
            <Button
              className="p-button-success"
              label="Save"
              onClick={onSave}
            />
          </div>
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
        </>
      )}
    </div>
  );
};

export default CortexEditor;