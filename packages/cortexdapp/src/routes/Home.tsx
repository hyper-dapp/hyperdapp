import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../store/store";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import {
  getCortexData,
  getCortexList,
  saveCortex,
} from "../store/slices/cortex";
import { useChain, useMoralis } from "react-moralis";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const Home = () => {
  const { user } = useMoralis();
  const { chainId } = useChain();
  const { list, isLoading } = useAppSelector((store) => store.cortex);
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
            const payload = { cortexId: rowData.id, chainId, user };
            await dispatch(getCortexData(payload));
            await navigate(`/cortex/${rowData.id}/contracts`);
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
      {!isLoading && !list.length && (
        <div className="flex flex-col gap-8">
          <p className="text-5xl">Welcome to HyperDapp! 🚀</p>
          <p className="text-4xl">You don't have any cortex defined yet.</p>
          <div className="flex flex-row gap-4">
            <p className="text-3xl">Start creating yours today.</p>
            <Button
              label="Create"
              icon="pi pi-plus"
              iconPos="left"
              onClick={() => setDisplayDialog(true)}
            />
          </div>
        </div>
      )}
      {!isLoading && list.length > 0 && (
        <>
          <p className="text-4xl mb-14">Your Cortex</p>
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
              value={list}
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
          setDisplayDialog(true);
          setCortexName("");
        }}
        modal
      >
        <div className="flex flex-col gap-4">
          <p className="font-bold">Choose a name for your cortex:</p>
          <InputText
            value={cortexName}
            placeholder="E.g. Uniswap Interaction Flow"
            keyfilter="alpha"
            onChange={(e) => setCortexName(e.target.value)}
          />
          <Button
            label="Create"
            loading={isLoading}
            onClick={async () => {
              if (!cortexName || !chainId || !user) return;
              const cortex = { name: cortexName, createdBy: user, chainId };
              const { payload } = await dispatch(saveCortex(cortex));
              await navigate(`/cortex/${payload.id}/contracts`);
            }}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Home;
