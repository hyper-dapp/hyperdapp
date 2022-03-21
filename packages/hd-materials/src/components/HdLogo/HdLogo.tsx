import React, { FC } from "react";
import { HdLogoProps } from "./HdLogo.types";
// @ts-ignore
import logo from "../../images/hd-logo.png";

const HdLogo: FC<HdLogoProps> = ({
  isClickable = false,
  onClick = () => null,
}) => {
  return (
    <img
      className={isClickable ? "cursor-pointer" : ""}
      src={logo}
      onClick={onClick}
      width="170"
      height="70"
      alt="hd-logo"
    />
  );
};

export default HdLogo;
