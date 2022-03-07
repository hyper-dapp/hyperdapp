import { useMemo, useState } from "react";
import { useChain } from "react-moralis";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getContractABI } from "../store/slices/contracts";

const ContractABIs = () => {
  const { chainId } = useChain();
  const [data, setData] = useState({ name: "", address: "" });
  const contracts = useAppSelector((store) => store.contracts);
  const dispatch = useAppDispatch();

  const contractsList = useMemo(() => {
    return Object.keys(contracts).map((address) => {
      return {
        name: contracts[address].name,
        address,
      };
    });
  }, [contracts]);

  const loadABI = async () => {
    const { address } = data;
    if (!address || !chainId) return;
    await dispatch(getContractABI({ chainId, ...data }));
    setData({ name: "", address: "" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-bold">Name</p>
          <InputText
            value={data.name}
            keyfilter="alphanum"
            onChange={(e) =>
              setData((val) => ({ ...val, name: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold">Address</p>
          <InputText
            value={data.address}
            keyfilter="alphanum"
            onChange={(e) =>
              setData((val) => ({ ...val, address: e.target.value }))
            }
          />
        </div>
        <Button
          icon="pi pi-plus"
          className="p-button-rounded p-button-outlined self-end"
          loading={contracts[data.address]?.isLoading}
          onClick={loadABI}
        />
      </div>
      <DataTable value={contractsList} responsiveLayout="scroll">
        <Column field="name" header="Name" />
        <Column field="address" header="Address" />
      </DataTable>
    </div>
  );
};

export default ContractABIs;
