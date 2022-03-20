import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "primereact/badge";
import { Skeleton } from "primereact/skeleton";
import { ChatType } from "../../models/chat.models";
import { useAppSelector } from "../../store/store";
import Blockie from "../Blockie";

const ChatList = () => {
  const { chatId } = useParams();
  const { data, isLoading } = useAppSelector((store) => store.chats);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 mt-8">
        <div className="flex flex-row items-center p-2">
          <Skeleton shape="circle" size="32px" className="mr-2" />
          <div className="flex-1">
            <Skeleton width="100%" />
          </div>
        </div>
        <div className="flex flex-row items-center p-2">
          <Skeleton shape="circle" size="32px" className="mr-2" />
          <div className="flex-1">
            <Skeleton width="100%" />
          </div>
        </div>
        <div className="flex flex-row items-center p-2">
          <Skeleton shape="circle" size="32px" className="mr-2" />
          <div className="flex-1">
            <Skeleton width="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col gap-4 items-center p-4">
        <p>You're not part of any chat yet!</p>
        <p className="font-bold">Start using HyperDapp</p>
        <p>Create your first room today</p>
        <p className="text-3xl">🚀</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 overflow-y-auto gap-2 mt-8">
      {data.map((chat, i) => (
        <div
          key={i}
          className="flex flex-row items-center gap-4 p-2"
          onClick={() =>
            navigate(
              `${
                chat.type === ChatType.CONTRACT
                  ? "/contract/" + chat.contractAddress
                  : "/chat/" + chat.id
              }`
            )
          }
        >
          <div className="flex flex-row items-center gap-2 min-w-0 w-full cursor-pointer">
            <Blockie address={chat.name} size={8} />
            <p
              className={`flex-1 truncate${
                chat.id === chatId ? " font-bold" : ""
              }`}
              title={chat.name}
            >
              {chat.name}
            </p>
            <Badge value={chat.users.length} severity="success" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default ChatList;
