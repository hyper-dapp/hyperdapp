import axios from "axios";
import { networkConfigs } from "hd-materials";
import { ContractMethodModels } from "../models/contract-method.models";

const apiKey = process.env["REACT_APP_ETHERSCAN_API_KEY"] as string;

const fetchContractABI = async (
  chainId: string,
  address: string
): Promise<ContractMethodModels[]> => {
  const baseURL = (networkConfigs as any)[chainId].etherscanAPI;
  const { data } = await axios.get(
    `${baseURL}?module=contract&action=getabi&apiKey=${apiKey}&address=${address}`
  );
  return JSON.parse(data.result);
};

export { fetchContractABI };
