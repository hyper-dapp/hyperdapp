import { HdLoader } from "hd-materials";
import Moralis from "moralis";
import { ReactElement, useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { ChatType } from "../../models/chat.models";
import {
  MessageMoralisEntity,
  MessageModel,
} from "../../models/message.models";
import { useAppSelector } from "../../store/store";
import WalletTransfer from "./WalletTransfer/WalletTransfer";
import MessageBox from "./MessageBox/MessageBox";

interface ChatFeedProps {
  isLoading: boolean;
  chatType: ChatType;
  messages: Array<MessageMoralisEntity | MessageModel>;
  userInputTemplate: ReactElement;
}

const ChatFeed = (props: ChatFeedProps) => {
  const { isLoading, chatType, messages, userInputTemplate } = props;
  const { online: onlineUsers } = useAppSelector((store) => store.users);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [receiver, setReceiver] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => messagesEndRef?.current?.scrollIntoView(), [messages]);

  const onDisplayDialog = (receiver: string) => {
    setDisplayDialog(true);
    setReceiver(receiver);
  };

  const onHideDialog = () => {
    setDisplayDialog(false);
    setReceiver("");
  };

  const getMessageSender = (from: any) => {
    if (typeof from === "string") return from;
    return (from as any).ethAddress;
  };

  const getConnectionStatus = (from: string | Moralis.User) => {
    if (typeof from === "string") return true;
    return Boolean(onlineUsers[from.id]);
  };

  const messagesList = (
    <div className="grid grid-cols-12 gap-y-2">
      {messages.map(
        (message: MessageMoralisEntity | MessageModel, index: number) => {
          const { from, ...props } = message;
          const sender = getMessageSender(from);
          const isOnline = getConnectionStatus(from);
          const onAvatarClick = () =>
            chatType === ChatType.ROOM ? onDisplayDialog(sender) : undefined;

          return (
            <MessageBox
              key={index}
              from={sender}
              isOnline={isOnline}
              onAvatarClick={onAvatarClick}
              {...props}
            />
          );
        }
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full overflow-x-auto mb-4 relative">
        {!isLoading ? messagesList : <HdLoader />}
      </div>
      {userInputTemplate}
      <Dialog
        header="Transfer"
        visible={displayDialog}
        draggable={false}
        resizable={false}
        onHide={onHideDialog}
        style={{ width: "500px" }}
      >
        <WalletTransfer receiver={receiver} onHideDialog={onHideDialog} />
      </Dialog>
    </>
  );
};

export default ChatFeed;
