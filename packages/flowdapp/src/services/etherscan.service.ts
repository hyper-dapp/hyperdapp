import axios from "axios";

const baseURL = "https://api.etherscan.io/api";
const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY as string;

const fetchContractABI = async (address: string) => {
  const { data } = await axios.get(
    `${baseURL}?module=contract&action=getabi&apiKey=${apiKey}&address=${address}`
  );
  return JSON.parse(data.result);
};

export { fetchContractABI };
