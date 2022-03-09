import { useMemo, useState } from "react";
import { useChain } from "react-moralis";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getContractABI } from "../../store/slices/contracts";

const CortexContracts = () => {
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
    const { name, address } = data;
    if (!name || !address || !chainId) return;
    await dispatch(getContractABI({ chainId, ...data }));
    setData({ name: "", address: "" });
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex flex-row gap-4">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-primary p-button-text"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
        />
      </div>
    );
  };

  return (
    <>
      <p className="text-4xl mb-14">Contract ABIs</p>
      <div className="flex flex-col gap-8">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-bold">Name</p>
            <InputText
              value={data.name}
              placeholder="E.g. BAYC"
              onChange={(e) =>
                setData((val) => ({ ...val, name: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold">Address</p>
            <InputText
              value={data.address}
              placeholder="E.g. 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"
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
        <DataTable
          dataKey="id"
          value={contractsList}
          size="small"
          scrollable
          scrollHeight="450px"
        >
          <Column field="name" header="Name" />
          <Column field="address" header="Address" />
          <Column body={actionBodyTemplate} exportable={false} />
        </DataTable>
      </div>
    </>
  );
};

export default CortexContracts;