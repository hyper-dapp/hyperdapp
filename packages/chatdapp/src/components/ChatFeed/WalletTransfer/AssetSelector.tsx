import { useMoralis, useNativeBalance, useERC20Balances } from "react-moralis";
import { useMemo, useState } from "react";
import {
  AutoComplete,
  AutoCompleteCompleteMethodParams,
} from "primereact/autocomplete";
import { Image } from "primereact/image";

export interface Asset {
  balance: string;
  decimals: number;
  name: string;
  symbol: string;
  thumbnail?: string | undefined;
  token_address: string;
  logo?: string | undefined;
}

const AssetSelector = ({ asset, setAsset }: any) => {
  const { Moralis } = useMoralis();
  const { data: nativeBalance, nativeToken } = useNativeBalance();
  const { data: erc20Balance } = useERC20Balances();
  const [filteredList, setFilteredList] = useState<Asset[]>([]);

  const fullBalance = useMemo(() => {
    if (!erc20Balance || !nativeBalance || !nativeToken) return [];

    return [
      {
        balance: nativeBalance.balance,
        decimals: nativeToken.decimals,
        name: nativeToken.name,
        symbol: nativeToken.symbol,
        token_address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      },
      ...erc20Balance,
    ] as Asset[];
  }, [erc20Balance, nativeBalance, nativeToken]);

  const searchMethod = (event: AutoCompleteCompleteMethodParams) => {
    setTimeout(() => {
      let filteredList: any[];

      if (!event.query.trim().length) {
        filteredList = [...fullBalance];
      } else {
        filteredList = fullBalance.filter((asset) => {
          const searchText = event.query.toLowerCase();
          const { token_address, symbol, name } = asset;
          return (
            token_address.toLowerCase().includes(searchText) ||
            symbol.toLowerCase().includes(searchText) ||
            name.toLowerCase().includes(searchText)
          );
        });
      }

      setFilteredList(filteredList);
    }, 250);
  };

  const itemTemplate = (item: Asset) => {
    const assetBalance = parseFloat(
      Moralis.Units.FromWei(item.balance, item.decimals).toFixed(6)
    );
    const assetLogo =
      item.logo || "https://etherscan.io/images/main/empty-token.png";

    return (
      <div className="flex flex-row justify-between font-bold">
        <div className="flex flex-row gap-2">
          <Image
            src={assetLogo}
            width="24px"
            height="24px"
            preview={false}
            alt="token_logo"
          />
          <p>{item.symbol}</p>
        </div>
        <p className="self-right">{assetBalance}</p>
      </div>
    );
  };

  return (
    <AutoComplete
      className="w-full"
      value={asset}
      suggestions={filteredList}
      completeMethod={searchMethod}
      itemTemplate={itemTemplate}
      field="symbol"
      dropdown
      forceSelection
      onChange={(e) => setAsset(e.value)}
    />
  );
};

export default AssetSelector;
