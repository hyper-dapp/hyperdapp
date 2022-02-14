import { Dialog } from "primereact/dialog";
import InitContractForm from "../ActionForms/InitContractForm";
import CreateChatForm from "../ActionForms/CreateChatForm";
import JoinRoomForm from "../ActionForms/JoinRoomForm";

export type ActionDialogType = "contract" | "wallet" | "create" | "join";

interface ActionDialogProps {
  dialogType: ActionDialogType | undefined;
  displayDialog: boolean;
  onHideDialog(): void;
}

const ActionDialog = ({
  displayDialog,
  dialogType,
  onHideDialog,
}: ActionDialogProps) => {
  const getDialogHeader = () => {
    switch (dialogType) {
      case "contract":
        return "Interact With Smart Contract";
      case "create":
        return "Create Chat Room";
      case "join":
        return "Join Chat Room";
    }
  };

  const dialogForm = () => {
    switch (dialogType) {
      case "contract":
        return <InitContractForm hideDialog={onHideDialog} />;
      case "create":
        return <CreateChatForm hideDialog={onHideDialog} />;
      case "join":
        return <JoinRoomForm hideDialog={onHideDialog} />;
    }
  };

  return (
    <Dialog
      header={getDialogHeader()}
      draggable={false}
      resizable={false}
      visible={displayDialog}
      onHide={onHideDialog}
      style={{ width: "500px " }}
    >
      {dialogForm()}
    </Dialog>
  );
};

export default ActionDialog;
