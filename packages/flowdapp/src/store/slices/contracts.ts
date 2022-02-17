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
      map: ContractMethodMap;
      view: ContractMethod[];
      payable: ContractMethod[];
      nonPayable: ContractMethod[];
    };
  };
}

const initialState: IContractSlice = {};

export const getContractABI = createAsyncThunk(
  "contracts/getContractABI",
  async (address: string) => {
    try {
      const abi = await fetchContractABI(address);
      const map: ContractMethodMap = {};
      let view: ContractMethod[] = [];
      let payable: ContractMethod[] = [];
      let nonPayable: ContractMethod[] = [];

      abi.forEach((fn) => {
        if (fn.type === "constructor") {
          map[fn.type] = fn;
        } else {
          map[fn.name] = fn;
        }
        if (fn.stateMutability === "view") {
          view.push(fn);
        }
        if (fn.stateMutability === "payable") {
          payable.push(fn);
        }
        if (fn.stateMutability === "nonpayable") {
          nonPayable.push(fn);
        }
      });

      return { map, view, payable, nonPayable };
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
            map: {},
            view: [],
            payable: [],
            nonPayable: [],
          },
        };
      })
      .addCase(getContractABI.fulfilled, (state, action) => {
        const address = action.meta.arg;
        if (!action.payload) return;
        const { map, view, payable, nonPayable } = action.payload;
        state[address] = {
          isLoading: false,
          methods: {
            map,
            view,
            payable,
            nonPayable,
          },
        };
      });
  },
});

const { reducer } = contracts;
export default reducer;
