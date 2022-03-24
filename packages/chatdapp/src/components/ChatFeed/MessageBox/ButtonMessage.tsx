import { unescapeString } from "hyperdapp";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { useAppDispatch } from "../../../store/store";
import { sendMessage } from "../../../store/slices/messages";

interface ButtonMessageProps {
  message: string[];
}

const ButtonMessage = ({ message }: ButtonMessageProps) => {
  const [btnText] = message;
  const { contractId } = useParams();
  const dispatch = useAppDispatch();

  const executeAction = async () => {
    if (!contractId) return;

    dispatch(
      sendMessage({
        chatId: contractId,
        from: contractId,
        message_type: "text",
        message: "",
      })
    );
  };

  return (
    <Button
      className="p-2 bg-violet-600 text-white disabled:bg-gray-400"
      label={unescapeString(btnText)}
      onClick={() => executeAction()}
    />
  );
};

export default ButtonMessage;
