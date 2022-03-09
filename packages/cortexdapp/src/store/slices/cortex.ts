import Moralis from "moralis";
import { Elements } from "react-flow-renderer";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CortexMoralisEntity } from "../../models/cortex.models";

const Cortex = Moralis.Object.extend("Cortex");

interface ICortexSlice {
  isLoading: boolean;
  list: CortexMoralisEntity[];
  elements: {
    [cortexId: string]: Elements;
  };
}

const initialState: ICortexSlice = {
  isLoading: false,
  list: [],
  elements: {},
};

export const getCortexList = createAsyncThunk(
  "cortex/getCortexList",
  async (payload: { chainId: string; user: Moralis.User }) => {
    const { user, chainId } = payload;
    const query = new Moralis.Query("Cortex");
    query.equalTo("chainId", chainId);
    query.equalTo("createdBy", user);
    query.select("name");
    const results = await query.find();
    return results.map((cortex) => {
      const { id, attributes } = cortex;
      return { id, ...attributes };
    }) as CortexMoralisEntity[];
  }
);

export const getCortexData = createAsyncThunk(
  "cortex/getCortexData",
  async (payload: {
    cortexId: string;
    chainId: string;
    user: Moralis.User;
  }) => {
    const { cortexId, chainId, user } = payload;
    const query = new Moralis.Query("Cortex");
    query.equalTo("objectId", cortexId);
    query.equalTo("chainId", chainId);
    query.equalTo("createdBy", user);
    query.select("elements");
    const cortex = await query.first();
    const { id, attributes } = cortex || {};
    return { id, ...attributes } as CortexMoralisEntity;
  }
);

export const saveCortex = createAsyncThunk(
  "cortex/saveCortex",
  async (payload: Partial<CortexMoralisEntity>) => {
    const cortex = new Cortex();
    const result = await cortex.save(payload);
    const { id, attributes } = result;
    return { id, ...attributes };
  }
);

const elements = createSlice({
  name: "cortex",
  initialState,
  reducers: {
    setElementsState(
      state,
      action: PayloadAction<{ cortexId: string; elements: Elements }>
    ) {
      const { cortexId, elements } = action.payload;
      state.elements[cortexId] = elements;
    },
    setElementData(
      state,
      action: PayloadAction<{ cortexId: string; elementId: string; data: any }>
    ) {
      const { cortexId, elementId, data: newElData } = action.payload;
      state.elements[cortexId] = state.elements[cortexId].map((el) => {
        if (el.id === elementId) {
          const { data: oldElData, ...element } = el;
          const data = { ...oldElData, ...newElData };
          return { ...element, data };
        }
        return el;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCortexList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCortexList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(getCortexData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCortexData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.elements[action.meta.arg.cortexId] =
          action.payload.elements || [];
      })
      .addCase(saveCortex.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveCortex.fulfilled, (state, action) => {
        state.isLoading = false;
        state.elements[action.payload.id] = action.payload;
      });
  },
});

const { actions, reducer } = elements;
export const { setElementData, setElementsState } = actions;
export default reducer;
