import { useNavigate } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import WalletBtn from "./WalletBtn";

const Navbar = () => {
  const navigate = useNavigate();

  const start = (
    <img
      className="cursor-pointer mr-8"
      src="/images/hyperdapp-logo.png"
      onClick={() => navigate("home")}
      width="170"
      height="70"
      alt="HyperDapp"
    />
  );

  return (
    <Menubar
      className="hd-menubar bg-gray-600 border-0 rounded-none"
      start={start}
      end={<WalletBtn />}
    />
  );
};

export default Navbar;
