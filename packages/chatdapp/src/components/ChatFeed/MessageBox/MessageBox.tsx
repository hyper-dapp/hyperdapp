import { DateTime } from "luxon";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "../../../helpers/formatters";
import { MessageModel } from "../../../models/message.models";
import Blockie from "../../Blockie";
import ButtonMessage from "./ButtonMessage";
import EventMessage from "./EventMessage";
import MethodsMessage from "./MethodsMessage";
import { ContractMethod } from "../../../models/contract-method";
import { ContractEvent } from "../../../models/contract-event";

interface MessageBoxProps extends MessageModel {
  from: string;
  isOnline: boolean;
  created_at?: string;
  onAvatarClick?: () => void;
}

const MessageBox = ({
  from,
  isOnline,
  message,
  message_type,
  link,
  created_at,
  onAvatarClick,
}: MessageBoxProps) => {
  const { account } = useMoralis();

  const messageUI = (
    <>
      <div className="flex flex-col gap-2">
        <div className="text-xs text-gray-500 font-bold">
          {getEllipsisTxt(from)}
        </div>
        {message_type === "text" && <div className="text-base">{message}</div>}
        {message_type === "button" && (
          <ButtonMessage message={message as string[]} />
        )}
        {message_type === "method" && (
          <MethodsMessage message={message as ContractMethod[]} />
        )}
        {message_type === "event" && (
          <EventMessage message={message as ContractEvent} />
        )}
        {created_at &&
          DateTime.fromISO(created_at).toLocaleString(
            DateTime.DATETIME_SHORT
          ) && (
            <div className="text-xs text-gray-500 text-right">{created_at}</div>
          )}
      </div>
      {link && (
        <i
          className="pi pi-external-link absolute right-4 top-2 text-blue-500 cursor-pointer"
          onClick={() => window.open(link, "_blank")}
        />
      )}
    </>
  );

  const leftMessageBox = (
    <div className="col-start-1 col-end-8 p-3 rounded-lg">
      <div className="flex flex-row items-center">
        <div className="relative cursor-pointer" onClick={onAvatarClick}>
          <Blockie address={from} size={10} />
          <span
            className={`absolute rounded-full border-2 border-gray-100 ${
              isOnline ? "bg-green-400" : "bg-red-400"
            }`}
            style={{
              width: "15px",
              height: "15px",
              right: "-2px",
              bottom: "-2px",
            }}
          />
        </div>
        <div
          className="relative inline-block break-all ml-3 px-4 py-2 text-sm bg-white shadow rounded-xl"
          style={{ maxWidth: "500px" }}
        >
          {messageUI}
        </div>
      </div>
    </div>
  );

  const rightMessageBox = (
    <div className="col-start-6 col-end-13 p-3 rounded-lg">
      <div className="flex items-center justify-start flex-row-reverse">
        <Blockie address={from} size={10} />
        <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
          {messageUI}
        </div>
      </div>
    </div>
  );

  return from.toLowerCase() === account?.toLowerCase()
    ? rightMessageBox
    : leftMessageBox;
};

export default MessageBox;
