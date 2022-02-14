import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChain, useMoralis } from "react-moralis";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ChatPayload, ChatType } from "../../../models/chat.models";
import { useAppDispatch } from "../../../store/store";
import { saveChat } from "../../../store/slices/chats";

interface InitContractFormProps {
  hideDialog: () => void;
}

const InitContractForm = (props: InitContractFormProps) => {
  const { user } = useMoralis();
  const { chainId } = useChain();
  const [name, setName] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionHandler = async (): Promise<void> => {
    if (!user || !chainId || !contractAddress.length || !name.length) return;

    const payload: ChatPayload = {
      chainId,
      contractAddress,
      name,
      createdBy: user,
      isPrivate: true,
      type: ChatType.CONTRACT,
      users: [user.id],
    };
    payload.users.push(user.id);
    await dispatch(saveChat(payload));
    navigate(`/contract/${contractAddress}`);
    setContractAddress("");
    props.hideDialog();
  };

  return (
    <div className="flex flex-col gap-5">
      <span className="p-float-label mt-7">
        <InputText
          className="w-full"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="name">Name</label>
      </span>
      <span className="p-float-label mt-7">
        <InputText
          className="w-full"
          id="contractAddress"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
        <label htmlFor="contractAddress">Smart Contract Address</label>
      </span>
      <Button
        label="Start"
        onClick={actionHandler}
        disabled={!contractAddress.length || !name.length}
      />
    </div>
  );
};

export default InitContractForm;
