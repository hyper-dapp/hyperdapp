import { Chains, getExplorer } from "hd-materials";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useChain } from "react-moralis";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { sendMessage, setMessagesState } from "../../store/slices/messages";
import { ContractEvent } from "../../models/contract-event";
import { MethodStateMutability } from "../../models/contract-method";
import { MessageModel } from "../../models/message.models";

const filterMethods = (
  methods: { [key: string]: any },
  type: MethodStateMutability
) => {
  return Object.keys(methods)
    .filter((m) => methods[m].stateMutability === type)
    .map((m) => methods[m]);
};

const ContractMessage = () => {
  const { contractId } = useParams();
  const { chainId } = useChain();
  const contract = useAppSelector(
    (store) => contractId && store.contracts[contractId]
  );
  const [displayEvents, setDisplayEvents] = useState(true);
  const [eventsSubscription, setEventsSubscription] = useState<any>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!contract) return;

    const { address } = contract;

    const messagesState = {
      isLoading: false,
      chatId: address,
      data: [
        {
          chatId: address,
          from: address,
          message_type: "text",
          message: `Hello, I am the contract address ${address}`,
          link: `${getExplorer(chainId as Chains)}address/${address}`,
        } as MessageModel,
      ],
    };

    dispatch(setMessagesState(messagesState));
  }, [chainId, contractId, contract, dispatch]);

  useEffect(() => {
    if (!contract || !displayEvents) {
      if (eventsSubscription) {
        eventsSubscription.unsubscribe();
        setEventsSubscription(undefined);
      }
      return;
    }

    if (displayEvents && !eventsSubscription) {
      const subscription = contract.contract.events.allEvents(
        {},
        (error: any, event: ContractEvent) => {
          dispatch(
            sendMessage({
              chatId: contract.address,
              from: contract.address,
              message_type: "event",
              message: event,
              link: `${getExplorer(chainId as Chains)}tx/${
                event.transactionHash
              }`,
            })
          );
        }
      );
      setEventsSubscription(subscription);
    }
  }, [contract, chainId, displayEvents, eventsSubscription, dispatch]);

  const showMethodsHandler = (type: MethodStateMutability) => {
    const { address, methods } = contract;
    const filteredMethods = filterMethods(methods, type);
    if (!filteredMethods.length) return;

    dispatch(
      sendMessage({
        chatId: address,
        from: address,
        message_type: "method",
        message: filteredMethods,
      })
    );
  };

  if (!contract) return <div />;

  return (
    <div className="flex flex-row items-center gap-4 h-16 w-full rounded-xl bg-white px-4 py-6">
      <Button
        label="VIEW methods"
        className="p-button-success p-button-raised"
        onClick={() => showMethodsHandler("view")}
      />
      <Button
        label="NON-PAYABLE methods"
        className="p-button-success p-button-raised"
        onClick={() => showMethodsHandler("nonpayable")}
      />
      <Button
        label="PAYABLE methods"
        className="p-button-success p-button-raised"
        onClick={() => showMethodsHandler("payable")}
      />
      <Divider layout="vertical" />
      <div className="flex flex-row items-center gap-2">
        <Checkbox
          inputId="displayEvents"
          onChange={() => setDisplayEvents(!displayEvents)}
          checked={displayEvents}
        />
        <label htmlFor="displayEvents" className="p-checkbox-label">
          Display Events
        </label>
      </div>
    </div>
  );
};

export default ContractMessage;
