import { ethers } from "ethers";
import { ChangeEvent, useState } from "react";
import { useMoralis } from "react-moralis";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { sendMessage } from "../../../store/slices/messages";
import { ContractMethod } from "../../../models/contract-method";

interface MethodsMessageProps {
  message: ContractMethod[];
}

interface MethodPayloadState {
  [k: string]: string | undefined;
}

const MethodsMessage = ({ message }: MethodsMessageProps) => {
  const { contractId } = useParams();
  const { account } = useMoralis();
  const contract = useAppSelector(
    (store) => contractId && store.contracts[contractId]
  );
  const [displayDialog, setDisplayDialog] = useState(false);
  const [method, setMethod] = useState<ContractMethod>();
  const [methodPayload, setMethodPayload] = useState<MethodPayloadState>({});
  const [value, setValue] = useState<string>("");
  const dispatch = useAppDispatch();

  const executeMethod = async (
    method: ContractMethod,
    methodPayload: MethodPayloadState = {}
  ) => {
    if (!contract) {
      return Promise.reject("No valid contract");
    }
    const args = methodPayload
      ? Object.keys(methodPayload).map((k) => methodPayload[k])
      : undefined;
    const eth = value ? ethers.utils.parseEther(value).toString() : undefined;
    const result = await contract.execute(method, account, args, eth);
    dispatch(
      sendMessage({
        chatId: contract.address,
        from: contract.address,
        message_type: "text",
        message: `Method ${
          method.name
        } execution completed! Result: ${JSON.stringify(result)}`,
      })
    );
  };

  const selectMethodHandler = async (method: ContractMethod) => {
    if (method.inputs.length > 0 || method.payable) {
      setMethod(method);
      setDisplayDialog(true);
    } else {
      await executeMethod(method);
    }
  };

  const updatePayloadHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { name, value } = target;
    setMethodPayload((state) => ({ ...state, [name]: value }));
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setMethod(undefined);
    setMethodPayload({});
  };

  const methodsList = (methods: ContractMethod[]) => {
    return methods.map((method, index) => {
      return (
        <Button
          label={method.name}
          className="p-button-raised p-button-warning"
          onClick={() => selectMethodHandler(method)}
          key={index}
        />
      );
    });
  };

  const inputsList = (method: ContractMethod) => {
    return method.inputs.map((input, index) => {
      return (
        <div className="flex flex-col gap-2" key={index}>
          <label className="p-d-block" htmlFor={input.name}>
            {input.name}
          </label>
          <InputText
            className="p-d-block"
            name={input.name}
            placeholder={input.type}
            value={methodPayload[input.name]}
            onChange={updatePayloadHandler}
          />
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-5">{methodsList(message)}</div>
      {method && (
        <Dialog
          header={method.name}
          draggable={false}
          resizable={false}
          visible={displayDialog}
          onHide={hideDialog}
          style={{ width: "350px " }}
        >
          <div className="flex flex-col gap-4 pt-5">
            {inputsList(method)}
            {method.payable && (
              <div>
                <div className="flex flex-col gap-2">
                  <label className="p-d-block" htmlFor="value">
                    value
                  </label>
                  <InputText
                    className="p-d-block"
                    name="value"
                    placeholder="eth"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              </div>
            )}
            <Button
              label="Execute"
              onClick={async () => {
                await executeMethod(method, methodPayload);
                hideDialog();
              }}
              autoFocus
            />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default MethodsMessage;
