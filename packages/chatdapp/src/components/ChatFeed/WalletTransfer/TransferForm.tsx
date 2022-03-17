import { useState } from "react";
import { useMoralis, useChain } from "react-moralis";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TOAST_TXT } from "../../../models/toast.models";
import { getEllipsisTxt } from "../../../helpers/formatters";
import { getExplorer } from "../../../helpers/networks";
import Blockie from "../../Blockie";
import AssetSelector, { Asset } from "./AssetSelector";

interface TransferPayload {
  amount: string;
  asset: Asset | null;
  receiver: string;
}

interface TransferFormProps {
  receiver: string;
  onHideDialog(): void;
}

const TransferForm = (props: TransferFormProps) => {
  const initialPayload = {
    amount: "",
    asset: null,
    receiver: props.receiver,
  };
  const { Moralis } = useMoralis();
  const { chainId } = useChain();
  const [payload, setPayload] = useState<TransferPayload>(initialPayload);
  const [isPending, setIsPending] = useState(false);

  const { amount, asset, receiver } = payload;
  const isFormInvalid = !amount || !asset || !receiver;

  const openExplorer = (url: string) => {
    window.open(url, "_blank");
  };

  const transferHandler = async () => {
    if (isFormInvalid) return;

    let options: any;
    switch (asset.token_address) {
      case "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
        options = {
          type: "native",
          amount: Moralis.Units.ETH(amount),
          receiver,
          awaitReceipt: false,
        };
        break;
      default:
        options = {
          type: "erc20",
          amount: Moralis.Units.Token(amount, asset.decimals),
          receiver,
          contractAddress: asset.token_address,
          awaitReceipt: false,
        };
    }

    setIsPending(true);

    const txStatus = (await Moralis.Web3.transfer(options)) as any;

    txStatus
      .on("transactionHash", (hash: string) => {
        const url = `${getExplorer(chainId)}tx/${hash}`;
        toast.loading(
          <div>
            <p>{TOAST_TXT.TRANSACTION_PROCESS}</p>
            <Button
              className="p-button-text p-0"
              label={getEllipsisTxt(hash)}
              icon="pi pi-external-link"
              onClick={() => openExplorer(url)}
            />
          </div>
        );
      })
      .on("receipt", (data: any) => {
        const { transactionHash } = data;
        const url = `${getExplorer(chainId)}tx/${transactionHash}`;
        const hash = getEllipsisTxt(transactionHash);
        toast.dismiss();
        toast.success(
          <div>
            <p>{TOAST_TXT.TRANSACTION_CONFIRMED}</p>
            <Button
              className="p-button-text p-0"
              label={hash}
              icon="pi pi-external-link"
              onClick={() => openExplorer(url)}
            />
          </div>
        );
        setIsPending(false);
        setPayload(initialPayload);
        props.onHideDialog();
      })
      .on("error", (error: any) => {
        toast.error(`${TOAST_TXT.ERROR_OCCURRED} ${error.message}`);
        setIsPending(false);
      });
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-center">
          <span className="font-bold w-1/5">Address:</span>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <Blockie address={payload.receiver.toLowerCase()} size={6} />
            </span>
            <InputText
              placeholder="Public Address 0x..."
              value={receiver.toLowerCase()}
              onChange={(e) =>
                setPayload((state) => ({ ...state, receiver: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex flex-row items-center">
          <span className="font-bold w-1/5">Amount:</span>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-wallet" />
            </span>
            <InputText
              className="w-full"
              value={amount}
              onChange={(e) =>
                setPayload((state) => ({ ...state, amount: e.target.value }))
              }
              placeholder="Amount"
            />
          </div>
        </div>
        <div className="flex flex-row items-center">
          <span className="font-bold w-1/5">Asset:</span>
          <AssetSelector
            asset={asset}
            setAsset={(asset: Asset) =>
              setPayload((state) => ({ ...state, asset }))
            }
          />
        </div>
        <Button
          className="w-full justify-center"
          label="Transfer 💸"
          loading={isPending}
          iconPos="right"
          onClick={transferHandler}
          disabled={isFormInvalid}
        />
      </div>
    </>
  );
};

export default TransferForm;
