import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { convertABIToPrologCode } from "../../helpers/contract.helper";

const { Block3 } = window as any;
const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY;

interface ContractConfig {
  address: string;
  owner: string;
  network: string;
}

interface IContractSlice {
  [contractAddress: string]: any;
}

const initialState: IContractSlice = {};

export const initContract = createAsyncThunk(
  "contracts/initContract",
  async (config: ContractConfig) => {
    try {
      const c = new Block3.Contracts.Contract(config);
      const block3 = new Block3({ apiKey });
      const contract = await block3.loadContract(c);
      const code = convertABIToPrologCode(contract.address, contract.abi);
      return { ...contract._, code };
    } catch (error) {}
  }
);

const contracts = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    resetContractState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initContract.fulfilled, (state, action) => {
      const { address } = action.payload;
      state[address] = action.payload;
    });
  },
});

const { actions, reducer } = contracts;
export const { resetContractState } = actions;
export default reducer;
