import React, { FC, useState } from "react";
import Blockie from "../Blockie";
import { AddressProps } from "./Address.types";
import { getEllipsisTxt } from "../../helpers";

const check = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="3"
    stroke="#21BF96"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l5 5l10 -10" />
    <title id="copied-address">Copied!</title>
  </svg>
);

const Address: FC<AddressProps> = ({
  address,
  avatar,
  copyable,
  size,
  scale,
  textStyles,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const copy = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#1780FF"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: "pointer" }}
      onClick={async () => {
        if (!address) return;
        await navigator.clipboard.writeText(address);
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 1000);
      }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M15 3v4a1 1 0 0 0 1 1h4" />
      <path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z" />
      <path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
      <title id="copy-address">Copy Address</title>
    </svg>
  );

  const identicon = (
    <Blockie address={address} size={size || 7} scale={scale || 4} />
  );

  const text = <p className={textStyles || ""}>{getEllipsisTxt(address)}</p>;

  return (
    <>
      {avatar === "top" && (
        <div className="flex flex-col items-center gap-2">
          {identicon}
          <div className="flex flex-row items-center gap-2">
            {text}
            {copyable && (isClicked ? check : copy)}
          </div>
        </div>
      )}
      {avatar === "bottom" && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-row items-center gap-2">
            {text}
            {copyable && (isClicked ? check : copy)}
          </div>
          {identicon}
        </div>
      )}
      {avatar === "left" && (
        <div className="flex flex-row items-center gap-4">
          {identicon}
          {text}
          {copyable && (isClicked ? check : copy)}
        </div>
      )}
      {avatar === "right" && (
        <div className="flex flex-row items-center gap-4">
          {copyable && (isClicked ? check : copy)}
          {text}
          {identicon}
        </div>
      )}
    </>
  );
};

export default Address;
