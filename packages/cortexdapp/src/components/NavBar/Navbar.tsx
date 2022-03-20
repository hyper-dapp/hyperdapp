import { Menubar } from "primereact/menubar";
import HyperdappLogo from "../HyperdappLogo";
import WalletBtn from "./WalletBtn";

const Navbar = () => {
  return (
    <Menubar
      className="hd-menubar bg-gray-600 border-0 rounded-none"
      start={<HyperdappLogo clickable={true} redirectTo="home" />}
      end={<WalletBtn />}
    />
  );
};

export default Navbar;
