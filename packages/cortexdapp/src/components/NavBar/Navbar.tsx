import { Toolbar } from "primereact/toolbar";
import WalletBtn from "./WalletBtn";

const Navbar = () => {
  const leftContent = (
    <img
      src="/images/hyperdapp-logo.png"
      width="170"
      height="70"
      className="d-inline-block align-top"
      alt="HyperDapp"
    />
  );

  const rightContent = <WalletBtn />;

  return (
    <Toolbar
      className="rounded-none border-t-0 border-r-0 border-l-0 border-gray-300 bg-gray-200"
      left={leftContent}
      right={rightContent}
    />
  );
};

export default Navbar;
