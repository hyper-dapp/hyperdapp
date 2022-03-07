import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { ToastContainer } from "react-toastify";
import { Menu } from "primereact/menu";
import Navbar from "./components/NavBar/Navbar";
import Loader from "./components/Loader";

const App = () => {
  const { isWeb3Enabled, isWeb3EnableLoading, enableWeb3 } = useMoralis();
  const navigate = useNavigate();

  const items = [
    {
      label: "Cortex",
      items: [
        {
          label: "Contract ABIs",
          icon: "pi pi-fw pi-folder",
          command: () => navigate("/cortex/abi"),
        },
        {
          label: "Context Variables",
          icon: "pi pi-fw pi-tags",
          command: () => navigate("/cortex/variables"),
        },
        {
          label: "Cortex Editor",
          icon: "pi pi-fw pi-sitemap",
          command: () => navigate("/cortex/editor"),
        },
      ],
    },
  ];

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3();
    }
  }, [isWeb3Enabled, isWeb3EnableLoading, enableWeb3]);

  return (
    <div className="flex flex-col h-screen w-full">
      {!isWeb3Enabled && <Loader />}
      {isWeb3Enabled && (
        <>
          <Navbar />
          <div className="flex flex-row w-full h-full">
            <Menu
              className="overflow-x-hidden overflow-y-auto h-full"
              style={{ width: "220px" }}
              model={items}
            />

            <div className="overflow-x-hidden overflow-y-auto w-full h-full">
              <div className="container mx-auto p-10 w-full h-full">
                <Outlet />
              </div>
            </div>
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            draggable
            pauseOnFocusLoss
            pauseOnHover
          />
        </>
      )}
    </div>
  );
};

export default App;
