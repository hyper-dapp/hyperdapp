import { HdLoader } from "hd-materials";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { ToastContainer } from "react-toastify";

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
          <Outlet />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </>
      )}
    </div>
  );
};

export default App;
