import React, { useState } from "react";
import { useChain } from "react-moralis";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getContractABI } from "../../store/slices/contracts";

const LoadAbiForm = () => {
  const { chainId } = useChain();
  const contracts = useAppSelector((store) => store.contracts);
  const [address, setAddress] = useState("");
  const dispatch = useAppDispatch();

  const loadABI = async () => {
    if (!address || !chainId) return;
    await dispatch(getContractABI({ chainId, address }));
    setAddress("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <InputText
          value={address}
          keyfilter="alphanum"
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button
          label="Load ABI"
          icon="pi pi-plus"
          loading={contracts[address]?.isLoading}
          onClick={loadABI}
        />
      </div>
      <div className="flex flex-col gap-2">
        {Object.keys(contracts).map((address, index) => (
          <p className="font-bold" key={index}>
            {address}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LoadAbiForm;
