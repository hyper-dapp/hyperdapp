import axios from "axios";
import { ContractMethod } from "../models/contract-method";
import { networkConfigs } from "../helpers/networks";

const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY as string;

const fetchContractABI = async (
  chainId: string,
  address: string
): Promise<ContractMethod[]> => {
  const baseURL = (networkConfigs as any)[chainId].etherscanAPI;
  const { data } = await axios.get(
    `${baseURL}?module=contract&action=getabi&apiKey=${apiKey}&address=${address}`
  );
  return JSON.parse(data.result);
};

export { fetchContractABI };
