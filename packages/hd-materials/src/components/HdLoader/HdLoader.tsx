import React, { FC } from "react";
import HdLogo from "../HdLogo";
import { HdLoaderProps } from "./HdLoader.types";

const HdLoader: FC<HdLoaderProps> = ({ color = "#07c8d6", size = "2em" }) => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-full">
      <HdLogo />
      <i className="pi pi-spin pi-spinner" style={{ color, fontSize: size }} />
    </div>
  );
};

export default HdLoader;
