import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchContractABI } from "../../services/etherscan.service";
import { ContractMethod } from "../../models/contract-method";

interface ContractMethodMap {
  [methodName: string]: ContractMethod;
}

interface IContractSlice {
  [contractAddress: string]: {
    isLoading: boolean;
    methods: {
      arr: ContractMethod[];
      map: ContractMethodMap;
    };
  };
}

const initialState: IContractSlice = {};

export const getContractABI = createAsyncThunk(
  "contracts/getContractABI",
  async (address: string) => {
    try {
      const arr = await fetchContractABI(address);
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
        const address = action.meta.arg;
        state[address] = {
          isLoading: true,
          methods: {
            arr: [],
            map: {},
          },
        };
      })
      .addCase(getContractABI.fulfilled, (state, action) => {
        if (!action.payload) return;
        const address = action.meta.arg;
        const { arr, map } = action.payload;
        state[address] = {
          isLoading: false,
          methods: { arr, map },
        };
      });
  },
});

const { reducer } = contracts;
export default reducer;
