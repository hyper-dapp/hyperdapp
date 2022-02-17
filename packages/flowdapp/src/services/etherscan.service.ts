import axios from "axios";
import { ContractMethod } from "../models/contract-method";

const baseURL = "https://api.etherscan.io/api";
const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY as string;

const fetchContractABI = async (address: string): Promise<ContractMethod[]> => {
  const { data } = await axios.get(
    `${baseURL}?module=contract&action=getabi&apiKey=${apiKey}&address=${address}`
  );
  return JSON.parse(data.result);
};

export { fetchContractABI };
