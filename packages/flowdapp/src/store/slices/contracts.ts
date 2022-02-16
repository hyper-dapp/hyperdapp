import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchContractABI } from "../../services/etherscan.service";

interface IContractSlice {
  [contractAddress: string]: {
    isLoading: boolean;
    methods: {
      view: any[];
      payable: any[];
      nonPayable: any[];
    };
  };
}

const initialState: IContractSlice = {};

export const getContractABI = createAsyncThunk(
  "contracts/getContractABI",
  async (address: string) => {
    try {
      const abi = await fetchContractABI(address);
      let view: any[] = [];
      let payable: any[] = [];
      let nonPayable: any[] = [];

      abi.forEach((fn: any) => {
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

      return { view, payable, nonPayable };
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
            view: [],
            payable: [],
            nonPayable: [],
          },
        };
      })
      .addCase(getContractABI.fulfilled, (state, action) => {
        const address = action.meta.arg;
        if (!action.payload) return;
        const { view, payable, nonPayable } = action.payload;
        state[address] = {
          isLoading: false,
          methods: {
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
