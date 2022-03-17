import { useState } from "react";
import { MenuItem } from "primereact/menuitem";
import ActionBtn from "./ActionBtn/ActionBtn";
import ActionDialog, { ActionDialogType } from "./ActionBtn/ActionDialog";

const ActionBtnContainer = () => {
  const [dialogType, setDialogType] = useState<ActionDialogType>();
  const [displayDialog, setDisplayDialog] = useState(false);

  const menuItems: MenuItem[] = [
    {
      label: "Interact With Smart Contract",
      icon: "pi pi-play",
      command: () => onDisplayDialog("contract"),
    },
    {
      label: "Create Chat Room",
      icon: "pi pi-users",
      command: () => onDisplayDialog("create"),
    },
  ];

  const onDisplayDialog = (dialogType: ActionDialogType) => {
    setDisplayDialog(true);
    setDialogType(dialogType);
  };

  const onHideDialog = () => {
    setDisplayDialog(false);
    setDialogType(undefined);
  };

  return (
    <>
      <ActionBtn menuItems={menuItems} />
      <ActionDialog
        dialogType={dialogType}
        displayDialog={displayDialog}
        onHideDialog={onHideDialog}
      />
    </>
  );
};

export default ActionBtnContainer;
