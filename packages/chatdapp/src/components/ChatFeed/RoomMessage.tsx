import { KeyboardEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useAppDispatch } from "../../store/store";
import { saveMessage } from "../../store/slices/messages";

const RoomMessage = () => {
  const { chatId } = useParams();
  const { user } = useMoralis();
  const [message, setMessage] = useState("");
  const dispatch = useAppDispatch();

  const sendUserMessage = () => {
    if (!user || !chatId || !message) return;
    dispatch(
      saveMessage({
        chatId,
        from: user,
        message_type: "text",
        message,
      })
    );
    setMessage("");
  };

  const keyDownHandler = (event: KeyboardEvent) => {
    if (event.key === "Enter") sendUserMessage();
  };

  return (
    <div className="flex flex-row gap-4 w-full">
      <InputText
        className="flex flex-grow border rounded-xl"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={keyDownHandler}
      />
      <Button
        className="p-button-rounded"
        label="Send"
        icon="pi pi-send"
        iconPos="right"
        onClick={sendUserMessage}
      />
    </div>
  );
};

export default RoomMessage;
