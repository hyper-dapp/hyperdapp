import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchContractABI } from "../../services/etherscan.service";
import { ContractMethodModels } from "../../models/contract-method.models";

interface ContractMethodMap {
  [methodName: string]: ContractMethodModels;
}

interface IContractSlice {
  [contractAddress: string]: {
    isLoading: boolean;
    name: string;
    methods: {
      arr: ContractMethodModels[];
      map: ContractMethodMap;
    };
  };
}

const initialState: IContractSlice = {};

export const getContractABI = createAsyncThunk(
  "contracts/getContractABI",
  async (payload: { chainId: string; name: string; address: string }) => {
    try {
      const { chainId, address } = payload;
      const arr = await fetchContractABI(chainId, address);
      const map: ContractMethodMap = {};

      arr.forEach((fn) => {
        const key = fn.type !== "constructor" ? fn.name : "constructor";
        map[key] = fn;
      });

      return { arr, map };
    } catch (error) {}
  }
);

const contracts = createSlice({
  name: "contracts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getContractABI.pending, (state, action) => {
        const { name, address } = action.meta.arg;
        state[address] = {
          isLoading: true,
          methods: { arr: [], map: {} },
          name,
        };
      })
      .addCase(getContractABI.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { name, address } = action.meta.arg;
        const { arr, map } = action.payload;
        state[address] = {
          isLoading: false,
          methods: { arr, map },
          name,
        };
      });
  },
});

const { reducer } = contracts;
export default reducer;
