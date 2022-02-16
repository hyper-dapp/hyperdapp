import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Edge, Elements } from "react-flow-renderer";
import Moralis from "moralis";

const Flow = Moralis.Object.extend("Flow");

export type ElementType =
  | "loadABI"
  | "viewMethods"
  | "nonPayableMethods"
  | "payableMethods"
  | "displayBtn"
  | "displayText";

interface ElementData {
  id: string;
  type: ElementType;
  value: any;
  output_variable?: any;
}

interface IFlowSlice {
  elements: Elements;
  data: {
    elements: { [id: string]: ElementData };
    edges: { [id: string]: Edge };
  };
}

const initialState: IFlowSlice = {
  elements: [],
  data: {
    elements: {},
    edges: {},
  },
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
      action: PayloadAction<{ elements: Elements; data: ElementData }>
    ) {
      const { elements, data } = action.payload;
      const { id } = data;
      state.elements = elements;
      state.data.elements = { ...state.data.elements, [id]: data };
    },
    updateElementsData(
      state,
      action: PayloadAction<{ id: string; value: any }>
    ) {
      const { id, value } = action.payload;
      const newValue = { ...state.data.elements[id], value } as ElementData;
      state.data.elements = { ...state.data.elements, [id]: newValue };
    },
    setEdgesData(state, action: PayloadAction<{ id: string; edge: Edge }>) {
      const { id, edge } = action.payload;
      state.data.edges = { ...state.data.edges, [id]: edge };
    },
  },
});

const { actions, reducer } = elements;
export const {
  setElementsData,
  setElementsState,
  updateElementsData,
  setEdgesData,
} = actions;
export default reducer;
