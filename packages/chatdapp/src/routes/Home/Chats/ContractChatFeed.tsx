import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMoralis, useChain } from "react-moralis";
import { toast } from "react-toastify";
import { TOAST_TXT } from "../../../models/toast.models";
import { ChatType } from "../../../models/chat.models";
import { getChainName } from "../../../helpers/networks";
import { getEllipsisTxt } from "../../../helpers/formatters";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { initContract } from "../../../store/slices/contracts";
import { initFlow } from "../../../store/slices/flows";
import ChatFeed from "../../../components/ChatFeed/ChatFeed";
import ContractMessage from "../../../components/ChatFeed/ContractMessage";

const ContractChatFeed = () => {
  const { contractId } = useParams();
  const { account } = useMoralis();
  const { chainId } = useChain();
  const messages = useAppSelector((store) => store.messages);
  const dispatch = useAppDispatch();
  const network = getChainName(chainId);

  useEffect(() => {
    const initChatFeed = async () => {
      if (!contractId || !account || !network) return;

      if (contractId === "0x3C1F9d85d20bCDBafc35c81898b95025576819E6") {
        await dispatch(initFlow(contractId));
        return;
      }

      const contract = await dispatch(
        initContract({
          address: contractId,
          owner: account,
          network,
        })
      );

      if (!contract.payload && contract.type.includes("rejected")) {
        toast.error(TOAST_TXT.CONTRACT_INITIALIZATION_ERROR);
      } else {
        toast.success(
          <div>
            Contract <strong>{getEllipsisTxt(contractId)}</strong> has been
            initialized!
          </div>
        );
      }
    };

    initChatFeed();
  }, [account, contractId, network, dispatch]);

  return (
    <div className="flex flex-col h-full overflow-x-auto relative">
      {contractId && (
        <ChatFeed
          chatType={ChatType.CONTRACT}
          isLoading={messages[contractId]?.isLoading}
          messages={messages[contractId]?.data || []}
          userInputTemplate={<ContractMessage />}
        />
      )}
    </div>
  );
};

export default ContractChatFeed;
