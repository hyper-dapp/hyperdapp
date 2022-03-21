import { HdLoader, HdLogo } from "hd-materials";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { ToastContainer } from "react-toastify";
import { Menubar } from "primereact/menubar";
import WalletBtn from "./components/WalletBtn";

const App = () => {
  const { isWeb3Enabled, isWeb3EnableLoading, enableWeb3 } = useMoralis();

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3();
    }
  }, [isWeb3Enabled, isWeb3EnableLoading, enableWeb3]);

  return (
    <div className="flex flex-col h-screen w-full">
      {!isWeb3Enabled && <HdLoader />}
      {isWeb3Enabled && (
        <>
          <Menubar
            className="hd-menubar bg-gray-600 border-0 rounded-none"
            start={<HdLogo />}
            end={<WalletBtn />}
          />
          <div className="overflow-x-hidden overflow-y-auto w-full h-full">
            <Outlet />
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
