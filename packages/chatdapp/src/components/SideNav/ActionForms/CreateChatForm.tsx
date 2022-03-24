import { Address, getEllipsisTxt } from "hd-materials";
import { useState } from "react";
import { useChain, useMoralis } from "react-moralis";
import { useNavigate } from "react-router-dom";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ChatPayload, ChatType } from "../../../models/chat.models";
import { User } from "../../../models/user.models";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getUser } from "../../../store/slices/users";
import { saveChat } from "../../../store/slices/chats";

enum Access {
  PUBLIC = "public",
  PRIVATE = "private",
  PRIVATE_EXISTING_CONTRACT = "private-existing-contract",
  PRIVATE_NEW_CONTRACT = "private-new-contract",
}

interface ChatFormState {
  name: string;
  access: Access;
  users: User[];
  contract?: string;
}

const accessDropdown = [
  {
    label: "Public",
    value: Access.PUBLIC,
  },
  {
    label: "Private",
    value: Access.PRIVATE,
  },
  {
    label: "Private from existing contract (coming soon)",
    value: Access.PRIVATE_EXISTING_CONTRACT,
    disabled: true,
  },
  {
    label: "Private from new contract (coming soon)",
    value: Access.PRIVATE_NEW_CONTRACT,
    disabled: true,
  },
];

const initialState: ChatFormState = {
  name: "",
  access: Access.PUBLIC,
  users: [],
  contract: "",
};

interface CreateChatFormProps {
  hideDialog: () => void;
}

const CreateChatForm = (props: CreateChatFormProps) => {
  const { user } = useMoralis();
  const { chainId } = useChain();
  const { data: users, error } = useAppSelector((store) => store.users);
  const [chat, setChat] = useState<ChatFormState>(initialState);
  const [filteredUsers, setFilteredUsers] = useState<User[]>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const itemTemplate = (user: User) => {
    const { ethAddress } = user;
    if (!ethAddress) return null;
    return <Address address={ethAddress} avatar="left" />;
  };

  const selectedItemTemplate = (user: User) => {
    const { ethAddress } = user;
    if (!ethAddress) return null;
    return <Address address={getEllipsisTxt(ethAddress)} avatar="left" />;
  };

  const isPrivateChat = (chat: ChatFormState) => {
    switch (chat.access) {
      case Access.PRIVATE ||
        Access.PRIVATE_EXISTING_CONTRACT ||
        Access.PRIVATE_NEW_CONTRACT:
        return true;
      case Access.PUBLIC:
        return false;
      default:
        return false;
    }
  };

  const actionHandler = async (): Promise<void> => {
    if (!user || !chainId || !chat.name || !chat.users.length) return;

    const isPrivate = isPrivateChat(chat);
    const payload: ChatPayload = {
      chainId,
      isPrivate,
      createdBy: user,
      name: chat.name,
      type: ChatType.ROOM,
      users: chat.users.map((u) => u.id),
    };
    payload.users.push(user.id);
    const newChat = await dispatch(saveChat(payload));
    navigate(`/chat/${newChat.payload.id}`);
    setChat(initialState);
    props.hideDialog();
  };

  const searchHandler = (s: string) => {
    setTimeout(async () => {
      let res: User[] = [];
      if (!s.trim().length) {
        res = [...users];
      } else if (users.length > 0) {
        res = users.filter(
          (u) => u.id?.startsWith(s) || u.ethAddress?.startsWith(s)
        );
      }
      if (!res.length) {
        const { payload } = await dispatch(getUser(s));
        res = payload ? [payload as User] : [];
      }
      setFilteredUsers(res);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-5">
      <span className="p-float-label mt-5">
        <InputText
          id="name"
          className="w-full"
          value={chat.name}
          onChange={(e) =>
            setChat((state) => ({ ...state, name: e.target.value }))
          }
        />
        <label htmlFor="name">Name</label>
      </span>

      <div className="flex flex-col gap-2">
        <p className="font-bold">Access</p>
        <Dropdown
          value={chat.access}
          options={accessDropdown}
          onChange={(e) => setChat((state) => ({ ...state, access: e.value }))}
          optionLabel="label"
          optionValue="value"
          optionDisabled="disabled"
          placeholder="Select access"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-bold">Members</p>
        <AutoComplete
          className="inline w-full"
          value={chat.users}
          suggestions={filteredUsers}
          completeMethod={(e) => searchHandler(e.query)}
          itemTemplate={itemTemplate}
          selectedItemTemplate={selectedItemTemplate}
          field="ethAddress"
          placeholder="Paste wallet address, ENS domain or user ID"
          multiple
          onChange={(e) => setChat((state) => ({ ...state, users: e.value }))}
        />
        {error && <small className="p-error p-d-block">{error}</small>}
      </div>

      <Button
        label="Create"
        onClick={actionHandler}
        disabled={!chat.name || !chat.users.length}
      />
    </div>
  );
};

export default CreateChatForm;
