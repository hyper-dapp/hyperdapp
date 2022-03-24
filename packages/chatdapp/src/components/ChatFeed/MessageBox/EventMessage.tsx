import { getEllipsisTxt } from "hd-materials";
import { ethers } from "ethers";
import { Chip } from "primereact/chip";
import { ContractEvent } from "../../../models/contract-event";

interface EventMessageProps {
  message: ContractEvent;
}

const EventMessage = ({ message }: EventMessageProps) => {
  const getReturnValues = (values: { [key: string]: string }) => {
    return Object.keys(values)
      .filter((v) => Number.isNaN(Number(v)))
      .map((v, index) => {
        const value = values[v];
        let label: string;
        if (v === "tokenId") {
          label = values[v];
        } else if (ethers.utils.isAddress(value) || value.length >= 42) {
          label = getEllipsisTxt(value);
        } else {
          label = Number(ethers.utils.formatEther(value)).toFixed(2);
        }
        return (
          <div className="flex flex-col gap-1" key={index}>
            <p className="font-bold">{v}</p>
            <Chip label={label} />
          </div>
        );
      });
  };

  return (
    <>
      <div className="text-base">{message.event}</div>
      <div className="flex flex-row gap-4">
        {getReturnValues(message.returnValues)}
      </div>
    </>
  );
};

export default EventMessage;
