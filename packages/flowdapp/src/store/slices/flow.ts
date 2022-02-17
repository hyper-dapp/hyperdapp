import Moralis from "moralis";
import { Elements } from "react-flow-renderer";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const Flow = Moralis.Object.extend("Flow");

export type ElementType =
  | "loadABI"
  | "nonPayableMethods"
  | "payableMethods"
  | "displayBtn"
  | "displayText"
  | "predicate"
  | "getData"
  | "callFn";

interface ElementData {
  type: ElementType;
  params: string[];
  inputs: string[];
  output: string;
}

interface IFlowSlice {
  elements: Elements;
  data: {
    [id: string]: {
      [fieldName: string]: any;
    };
  };
}

const initialState: IFlowSlice = {
  elements: [],
  data: {},
};

export const saveFlow = createAsyncThunk(
  "flow/saveFlow",
  async (payload: any) => {
    const chat = new Flow();
    return chat.save(payload);
  }
);

const elements = createSlice({
  name: "flow",
  initialState,
  reducers: {
    setElementsState(state, action: PayloadAction<Elements>) {
      state.elements = action.payload;
    },
    setElementsData(
      state,
      action: PayloadAction<{
        id: string;
        type: string;
        elements: Elements;
      }>
    ) {
      const { id, type, elements } = action.payload;
      state.elements = elements;
      state.data = { ...state.data, [id]: { type } };
    },
    updateElementsData(
      state,
      action: PayloadAction<{ id: string; [fieldName: string]: any }>
    ) {
      const { id, ...updatedObj } = action.payload;
      state.data[id] = { ...state.data[id], ...updatedObj };
    },
  },
});

const { actions, reducer } = elements;
export const { setElementsData, setElementsState, updateElementsData } =
  actions;
export default reducer;
