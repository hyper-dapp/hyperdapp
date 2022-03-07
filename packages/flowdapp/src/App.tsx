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

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3();
    }
  }, [isWeb3Enabled, isWeb3EnableLoading, enableWeb3]);

  let items = [
    {
      label: "Cortex",
      items: [
        {
          label: "Contract ABIs",
          icon: "pi pi-fw pi-folder",
          command: () => navigate("/cortex/abi"),
        },
        {
          label: "Cortex Editor",
          icon: "pi pi-fw pi-sitemap",
          command: () => navigate("/cortex/editor"),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen w-full">
      {!isWeb3Enabled && <Loader />}
      {isWeb3Enabled && (
        <>
          <Navbar />
          <div className="flex flex-row h-full w-full overflow-x-hidden">
            <Menu model={items} />
            <div className="container mx-auto p-10 h-full">
              <Outlet />
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
