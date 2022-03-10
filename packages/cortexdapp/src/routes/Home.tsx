import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChain, useMoralis } from "react-moralis";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { CortexMoralisEntity, CortexPayload } from "../models/cortex.models";
import { TOAST_TXT } from "../models/toast.models";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getCortexList, saveCortex } from "../store/slices/cortex";
import Loader from "../components/Loader";

const Home = () => {
  const { user } = useMoralis();
  const { chainId } = useChain();
  const { arr: cortexList, isLoading } = useAppSelector(
    (store) => store.cortex
  );
  const [cortexName, setCortexName] = useState("");
  const [displayDialog, setDisplayDialog] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user || !chainId) return;

    dispatch(getCortexList({ user, chainId }));
  }, [chainId, user, dispatch]);

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex flex-row gap-4">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-primary p-button-text"
          onClick={async () => {
            if (!chainId || !user) return;
            await navigate(`/cortex/${rowData.id}/editor`);
          }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-10 w-full h-full">
      {isLoading && <Loader />}
      {!isLoading && !cortexList.length && (
        <>
          <p className="text-5xl mt-20">Welcome to HyperDapp! 🚀</p>
          <div className="flex flex-col gap-4 mt-24 text-3xl">
            <p className="">You don't have any cortex defined yet.</p>
            <div className="flex flex-row gap-8">
              <p>Start creating yours today.</p>
              <Button
                label="Create"
                icon="pi pi-plus"
                iconPos="left"
                onClick={() => setDisplayDialog(true)}
              />
            </div>
          </div>
        </>
      )}
      {!isLoading && cortexList.length > 0 && (
        <>
          <p className="text-4xl mb-14">Cortex List</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row-reverse">
              <Button
                label="Create"
                icon="pi pi-plus"
                iconPos="left"
                onClick={() => setDisplayDialog(true)}
              />
            </div>
            <DataTable
              dataKey="id"
              value={cortexList}
              size="small"
              scrollable
              scrollHeight="450px"
            >
              <Column field="name" header="Name" />
              <Column body={actionBodyTemplate} exportable={false} />
            </DataTable>
          </div>
        </>
      )}
      <Dialog
        style={{ width: "350px " }}
        header="Create New Cortex"
        visible={displayDialog}
        draggable={false}
        resizable={false}
        closeOnEscape={false}
        dismissableMask={false}
        focusOnShow={false}
        onHide={() => {
          setDisplayDialog(false);
          setCortexName("");
        }}
        modal
      >
        <div className="flex flex-col gap-4">
          <p className="font-bold">Choose a name for your cortex:</p>
          <InputText
            value={cortexName}
            placeholder="E.g. Uniswap Interaction Flow"
            keyfilter="alphanum"
            onChange={(e) => setCortexName(e.target.value)}
          />
          <Button
            label="Create"
            loading={isLoading}
            onClick={async () => {
              if (!cortexName || !chainId || !user) return;
              const cortex: CortexPayload = {
                name: cortexName,
                createdBy: user,
                chainId,
                variables: [
                  {
                    name: "Connected Address",
                    value: "me/address",
                  },
                ],
                abis: [],
                flow: { position: [0, 0], zoom: 1, elements: [] },
              };
              const { payload } = await dispatch(saveCortex(cortex));
              setDisplayDialog(false);
              const cortexId = (payload as CortexMoralisEntity).id;
              await navigate(`/cortex/${cortexId}/contracts`);
              toast.success(TOAST_TXT.CORTEX_CREATED);
            }}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Home;
