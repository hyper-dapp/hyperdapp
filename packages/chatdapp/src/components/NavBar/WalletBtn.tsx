import { WalletButton } from "hd-materials";
import { useMoralis, useChain } from "react-moralis";
import { useHyperdapp } from "../../hooks/useHyperdapp";

const WalletBtn = () => {
  const { isAuthenticated, isAuthenticating, account } = useMoralis();
  const { chainId } = useChain();
  const { connectWallet, disconnectWallet } = useHyperdapp();

  return (
    <WalletButton
      account={account}
      chainId={chainId}
      isAuthenticating={isAuthenticating}
      isAuthenticated={isAuthenticated}
      onConnect={connectWallet}
      onDisconnect={disconnectWallet}
    />
  );
};

export default WalletBtn;
