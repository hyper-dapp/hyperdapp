import Moralis from "moralis";
import { Elements } from "react-flow-renderer";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const Flow = Moralis.Object.extend("Flow");

interface IFlowSlice {
  elements: Elements;
}

const initialState: IFlowSlice = {
  elements: [],
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
    setElementData(state, action: PayloadAction<{ id: string; data: any }>) {
      const { id, data: newElData } = action.payload;
      state.elements = state.elements.map((el) => {
        if (el.id === id) {
          const { data: oldElData, ...element } = el;
          const data = { ...oldElData, ...newElData };
          return { ...element, data };
        }
        return el;
      });
    },
  },
});

const { actions, reducer } = elements;
export const { setElementData, setElementsState } = actions;
export default reducer;
