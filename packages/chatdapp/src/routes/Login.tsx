import { useChain, useMoralis } from "react-moralis";
import { Navigate, useLocation } from "react-router-dom";
import { getChainName } from "../helpers/networks";
import HyperdappLogo from "../components/HyperdappLogo";
import WalletBtn from "../components/NavBar/WalletBtn";

const Login = () => {
  const { isAuthenticated } = useMoralis();
  const { chainId } = useChain();
  const location = useLocation();
  const networkName = getChainName(chainId).toUpperCase();

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div
        className="rounded-xl shadow-xl"
        style={{
          width: "550px",
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
        }}
      >
        <div className="flex flex-col items-center w-full p-5 rounded-t-xl bg-gray-600">
          <HyperdappLogo />
        </div>
        <div className="flex flex-col items-center gap-4 p-5 rounded-b-xl font-semibold">
          <p className="text-xl">Welcome to HyperDapp!</p>
          <p className="text-lg">We're happy to see you here 😁</p>
          <WalletBtn />
          <p className="font-normal text-sm">
            You're connected to <strong>{networkName}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
