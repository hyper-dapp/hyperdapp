import React, { FC } from "react";
import Blockies from "react-blockies";
import { Skeleton } from "primereact/skeleton";
import { BlockieProps } from "./Blockie.types";

const Blockie: FC<BlockieProps> = ({ address, size = 15, scale = 4 }) => {
  if (!address) {
    const px = `${size * scale}px`;
    return <Skeleton shape="circle" width={px} height={px} />;
  }

  return (
    <Blockies
      className="rounded-full"
      seed={address.toLowerCase()}
      size={size}
      scale={scale}
    />
  );
};

export default Blockie;
