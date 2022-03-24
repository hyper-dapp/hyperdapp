import { PromptsList } from "hd-materials";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { initFlow } from "../../../store/slices/flows";

const FlowChatFeed = () => {
  const { contractId } = useParams();
  const dispatch = useAppDispatch();
  const { isLoading, data } = useAppSelector((store) => store.flows);

  useEffect(() => {
    if (!contractId) return;
    dispatch(initFlow(contractId));
  }, [contractId, dispatch]);

  return (
    <>
      <div className="flex flex-col h-full overflow-x-auto relative">
        {isLoading && <div>Initializing flow code...</div>}
        {!isLoading && contractId && data && (
          <PromptsList address={contractId} flow={data} layout="divider" />
        )}
      </div>
    </>
  );
};

export default FlowChatFeed;
