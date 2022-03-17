import Moralis from "moralis";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { ChatType } from "../../../models/chat.models";
import { MessageMoralisEntity } from "../../../models/message.models";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  getMessages,
  sendMessage,
  setMessagesState,
} from "../../../store/slices/messages";
import RoomMessage from "../../../components/ChatFeed/RoomMessage";
import ChatFeed from "../../../components/ChatFeed/ChatFeed";

const RoomChatFeed = () => {
  const { chatId } = useParams();
  const { user } = useMoralis();
  const messages = useAppSelector((store) => store.messages);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!chatId || !user) return;

    const initChatFeed = async () => {
      await dispatch(setMessagesState({ isLoading: true, data: [], chatId }));
      await dispatch(getMessages(chatId));
      const query = new Moralis.Query("Message");
      query.equalTo("chatId", chatId);
      query.select("chatId", "from", "message", "message_type");
      const subscription = await query.subscribe();
      subscription.on("create", (message) => {
        const { id, attributes } = message;
        const { from, ...attr } = attributes;
        const payload = {
          id,
          from: from.attributes,
          ...attr,
        } as MessageMoralisEntity;
        dispatch(sendMessage(payload));
      });
    };

    initChatFeed();
  }, [chatId, dispatch, user]);

  return (
    <div className="flex flex-col h-full overflow-x-auto relative">
      {chatId && (
        <ChatFeed
          chatType={ChatType.ROOM}
          isLoading={messages[chatId]?.isLoading}
          messages={messages[chatId]?.data || []}
          userInputTemplate={<RoomMessage />}
        />
      )}
    </div>
  );
};

export default RoomChatFeed;
