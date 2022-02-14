import { Toolbar } from "primereact/toolbar";
import HyperdappLogo from "../HyperdappLogo";
import WalletBtn from "./WalletBtn";

const Navbar = () => {
  const leftContent = (
    <div className="flex flex-row items-center justify-center h-12 w-full">
      <HyperdappLogo />
      <div className="ml-2 font-bold text-2xl">Hyperdapp</div>
    </div>
  );

  const rightContent = <WalletBtn />;

  return <Toolbar left={leftContent} right={rightContent} />;
};

export default Navbar;
