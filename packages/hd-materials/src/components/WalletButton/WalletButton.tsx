import Address from "../Address";
import React, { FC, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { getExplorer } from "../../helpers";
import { getEllipsisTxt } from "../../helpers";
import { WalletButtonProps } from "./WalletButton.types";

const WalletButton: FC<WalletButtonProps> = ({
  account,
  chainId,
  isAuthenticating,
  isAuthenticated,
  onConnect,
  onDisconnect,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const btnLabel = useMemo(() => {
    return isAuthenticated
      ? getEllipsisTxt(account)
      : isAuthenticating
      ? "Connecting..."
      : "Connect Wallet";
  }, [account, isAuthenticating, isAuthenticated]);

  const btnHandler = isAuthenticated
    ? () => setIsModalVisible(true)
    : () => onConnect();

  return (
    <>
      <Button
        className="hd-button p-button-outlined p-button-rounded"
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
              onClick={() => {
                if (!chainId) return;
                const url = `${getExplorer(chainId)}/address/${account}`;
                window.open(url, "_blank");
              }}
            />
            <Button
              className="rounded-lg"
              label="Disconnect Wallet"
              onClick={async () => {
                await onDisconnect();
                setIsModalVisible(false);
              }}
            />
          </div>
        </Card>
      </Dialog>
    </>
  );
};

export default WalletButton;
