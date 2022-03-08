import WalletBtn from "./WalletBtn";
import { Menubar } from "primereact/menubar";

const Navbar = () => {
  const start = (
    <img
      src="/images/hyperdapp-logo.png"
      width="170"
      height="70"
      alt="HyperDapp"
    />
  );

  const end = <WalletBtn />;

  return (
    <Menubar
      className="bg-gray-600 border-0 rounded-none"
      start={start}
      end={end}
    />
  );
};

export default Navbar;
