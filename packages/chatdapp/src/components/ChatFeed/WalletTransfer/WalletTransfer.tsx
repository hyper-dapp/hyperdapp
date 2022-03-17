import { useMoralis, useNativeBalance } from "react-moralis";
import { Divider } from "primereact/divider";
import Address from "../../Address";
import TransferForm from "./TransferForm";

interface WalletTransferProps {
  receiver: string;
  onHideDialog(): void;
}

const WalletTransfer = (props: WalletTransferProps) => {
  const { receiver, onHideDialog } = props;
  const { account } = useMoralis();
  const { data: balance } = useNativeBalance();

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Address address={account} size={20} avatar="top" copyable />
        <div className="text-center font-bold whitespace-nowrap">
          {balance.formatted}
        </div>
      </div>
      <Divider />
      <TransferForm receiver={receiver} onHideDialog={onHideDialog} />
    </>
  );
};

export default WalletTransfer;
