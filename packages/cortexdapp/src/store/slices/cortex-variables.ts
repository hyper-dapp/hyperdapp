import Moralis from "moralis";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CtxVariableMoralisEntity,
  CtxVariablePayload,
} from "../../models/cortex.models";

const CtxVariable = Moralis.Object.extend("CortexCtxVariable");

interface ICtxVariablesSlice {
  isLoading: boolean;
  data: CtxVariablePayload[];
}

const initialState: ICtxVariablesSlice = {
  isLoading: false,
  data: [],
};

export const getCtxVariables = createAsyncThunk(
  "ctxVariables/getCtxVariables",
  async (cortexId: string) => {
    const query = new Moralis.Query("CortexCtxVariable");
    query.equalTo("cortexId", cortexId);
    query.select("name", "value");
    const results = await query.find();
    return results.map((ctx) => {
      const { id, attributes } = ctx;
      const { name, value } = attributes;
      return { id, name, value } as CtxVariableMoralisEntity;
    });
  }
);

export const saveCtxVariable = createAsyncThunk(
  "ctxVariables/saveCtxVariable",
  async (payload: CtxVariablePayload) => {
    const ctxVariable = new CtxVariable();
    const { id, attributes } = await ctxVariable.save(payload);
    const { name, value } = attributes;
    return { id, name, value } as CtxVariableMoralisEntity;
  }
);

const slice = createSlice({
  name: "ctxVariables",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCtxVariables.pending, (state, action) => {
        state.isLoading = true;
        state.data = [];
      })
      .addCase(getCtxVariables.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = [
          {
            name: "Connected Address",
            value: "me/address",
          } as CtxVariablePayload,
          ...action.payload,
        ];
      })
      .addCase(saveCtxVariable.fulfilled, (state, action) => {
        state.data = [...state.data, action.payload];
      });
  },
});

const { reducer } = slice;
export default reducer;
