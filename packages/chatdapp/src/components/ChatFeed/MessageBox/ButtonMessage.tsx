import { unescapeString } from "hyperdapp";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { sendMessage } from "../../../store/slices/messages";

interface ButtonMessageProps {
  message: string[];
}

const ButtonMessage = ({ message }: ButtonMessageProps) => {
  const [btnText, , actions] = message;
  const { contractId } = useParams();
  const flow = useAppSelector((store) => contractId && store.flows[contractId]);
  const dispatch = useAppDispatch();

  const executeAction = async () => {
    if (!contractId) return;

    const { effects } = await flow.execute(actions);

    for (let eff of effects) {
      dispatch(
        sendMessage({
          chatId: contractId,
          from: contractId,
          message_type: "text",
          message: JSON.stringify(eff),
        })
      );
    }
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
