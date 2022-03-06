import { Toolbar } from "primereact/toolbar";
import WalletBtn from "./WalletBtn";

const Navbar = () => {
  const leftContent = (
    <div className="flex flex-row items-center justify-center h-12 w-full">
      <img
        src="/images/hyperdapp-logo.png"
        width="170"
        height="70"
        className="d-inline-block align-top"
        alt="HyperDapp"
      />
    </div>
  );

  const rightContent = <WalletBtn />;

  return <Toolbar left={leftContent} right={rightContent} />;
};

export default Navbar;
