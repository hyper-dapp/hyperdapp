import { useMemo } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";

const Cortex = () => {
  const { cortexId } = useParams();
  const navigate = useNavigate();

  const items = useMemo<MenuItem[]>(() => {
    const baseURI = `/cortex/${cortexId}`;

    return [
      {
        label: "Contract ABIs",
        icon: "pi pi-fw pi-folder",
        command: () => navigate(`${baseURI}/contracts`),
      },
      {
        label: "Cortex Variables",
        icon: "pi pi-fw pi-globe",
        command: () => navigate(`${baseURI}/variables`),
      },
      {
        label: "Cortex Editor",
        icon: "pi pi-fw pi-sitemap",
        command: () => navigate(`${baseURI}/editor`),
      },
    ];
  }, [cortexId, navigate]);

  return (
    <div className="flex flex-row w-full h-full">
      <Menu model={items} style={{ minWidth: "220px" }} />
      <div className="container mx-auto p-10 w-full h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default Cortex;
