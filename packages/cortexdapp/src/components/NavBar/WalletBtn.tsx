import { useCallback, useMemo, useState } from "react";
import { useMoralis, useChain } from "react-moralis";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { useHyperdapp } from "../../hooks/useHyperdapp";
import { getEllipsisTxt } from "../../helpers/formatters";
import { getExplorer } from "../../helpers/networks";
import Address from "../Address";

const WalletBtn = () => {
  const { isAuthenticated, isAuthenticating, account } = useMoralis();
  const { chainId } = useChain();
  const { connectWallet, disconnectWallet } = useHyperdapp();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const btnLabel = useMemo(() => {
    return isAuthenticated
      ? getEllipsisTxt(account)
      : isAuthenticating
      ? "Connecting..."
      : "Connect Wallet";
  }, [account, isAuthenticating, isAuthenticated]);

  const btnHandler = useCallback(() => {
    return isAuthenticated ? setIsModalVisible(true) : connectWallet();
  }, [isAuthenticated, connectWallet]);

  const openExplorer = () => {
    const url = `${getExplorer(chainId)}/address/${account}`;
    window.open(url, "_blank");
  };

  const disconnect = async () => {
    await disconnectWallet();
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        className="p-button-outlined p-button-rounded"
        icon="pi pi-wallet"
        label={btnLabel}
        loading={isAuthenticating}
        onClick={btnHandler}
      />
      <Dialog
        className="font-medium text-lg"
        contentClassName="p-4"
        header="Account"
        draggable={false}
        resizable={false}
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        style={{ width: "350px" }}
      >
        <Card className="rounded-md">
          <div className="flex flex-col items-center gap-4">
            <Address address={account} avatar="left" copyable />
            <Button
              className="p-button-text p-0"
              label="View on Explorer"
              icon="pi pi-external-link"
              onClick={openExplorer}
            />
            <Button
              className="rounded-lg"
              label="Disconnect Wallet"
              onClick={disconnect}
            />
          </div>
        </Card>
      </Dialog>
    </>
  );
};

export default WalletBtn;
