import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/NavBar/Navbar";
import Loader from "./components/Loader";

const App = () => {
  const { isWeb3Enabled, isWeb3EnableLoading, enableWeb3 } = useMoralis();

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
