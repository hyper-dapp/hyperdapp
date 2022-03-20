import { Address } from "hd-materials";
import { useState } from "react";
import { useNFTBalances } from "react-moralis";
import {
  AutoComplete,
  AutoCompleteCompleteMethodParams,
} from "primereact/autocomplete";
import { Button } from "primereact/button";

interface SelectedAddress {
  address: string;
  count: number;
  symbol: string;
}

const InitContractForm = (props: any) => {
  const { data } = useNFTBalances();
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress>();
  const [filteredList, setFilteredList] = useState<SelectedAddress[]>([]);

  const actionHandler = async (): Promise<void> => {
    console.log(selectedAddress);
    setSelectedAddress(undefined);
    props.hideDialog();
  };

  const searchMethod = (event: AutoCompleteCompleteMethodParams) => {
    setTimeout(() => {
      const results = data?.result;
      const contracts = Array.from(
        new Set(results?.map((i) => i.token_address))
      ).map((address) => {
        const tokens = results?.filter((i) => address === i.token_address);
        return {
          address,
          count: tokens?.length || 0,
          symbol: (tokens && tokens[0].symbol) || "",
        };
      });

      let filteredList: SelectedAddress[];

      if (!event.query.trim().length) {
        filteredList = [...contracts];
      } else {
        filteredList = contracts.filter((i) => {
          return i.address.toLowerCase().startsWith(event.query.toLowerCase());
        });
      }

      setFilteredList(filteredList);
    }, 250);
  };

  const itemTemplate = (item: SelectedAddress) => {
    return (
      <div className="flex flex-row justify-between">
        <Address address={item.address} avatar="left" />
        <div>
          {item.symbol.toUpperCase()} ({item.count})
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <AutoComplete
        value={selectedAddress}
        suggestions={filteredList}
        completeMethod={searchMethod}
        itemTemplate={itemTemplate}
        field="address"
        dropdown
        forceSelection
        onChange={(e) => setSelectedAddress(e.value)}
      />
      <Button label="Join" onClick={actionHandler} autoFocus />
    </div>
  );
};

export default InitContractForm;
