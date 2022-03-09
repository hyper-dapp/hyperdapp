import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  getCtxVariables,
  saveCtxVariable,
} from "../../store/slices/cortex-variables";

const CortexVariables = () => {
  const { cortexId } = useParams();
  const { isLoading, data: ctxVariables } = useAppSelector(
    (store) => store.ctxVariables
  );
  const [data, setData] = useState({ name: "", value: "" });
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCtxVariables(cortexId || "test123"));
  }, [cortexId, dispatch]);

  const addContextVariable = async () => {
    const { name, value } = data;
    if (!name || !value) return;
    await dispatch(saveCtxVariable({ cortexId: "test123", name, value }));
    setData({ name: "", value: "" });
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
      <p className="text-4xl mb-14">Context Variables</p>
      <div className="flex flex-col gap-8">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-bold">Name</p>
            <InputText
              value={data.name}
              placeholder="E.g. Connected Address"
              onChange={(e) =>
                setData((val) => ({ ...val, name: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold">Value</p>
            <InputText
              value={data.value}
              placeholder="E.g. me/address"
              keyfilter="alpha"
              onChange={(e) =>
                setData((val) => ({ ...val, value: e.target.value }))
              }
            />
          </div>
          <Button
            icon="pi pi-plus"
            className="p-button-rounded p-button-outlined self-end"
            onClick={addContextVariable}
          />
        </div>
        <DataTable
          dataKey="id"
          value={ctxVariables}
          size="small"
          scrollable
          scrollHeight="450px"
          loading={isLoading}
        >
          <Column field="name" header="Name" />
          <Column field="value" header="Value" />
          <Column body={actionBodyTemplate} exportable={false} />
        </DataTable>
      </div>
    </>
  );
};

export default CortexVariables;
