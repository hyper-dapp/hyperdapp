import { useRef } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";

interface ActionButtonProps {
  menuItems: MenuItem[];
}

const ActionBtn = ({ menuItems }: ActionButtonProps) => {
  const menuRef = useRef(null);

  return (
    <div className="absolute right-5 bottom-5">
      <Menu id="popup_action" model={menuItems} ref={menuRef} popup />
      <Button
        className="p-button-rounded p-button-primary"
        icon="pi pi-plus"
        onClick={(event) => (menuRef.current as any).toggle(event)}
        aria-controls="popup_action"
        aria-haspopup
      />
    </div>
  );
};

export default ActionBtn;
