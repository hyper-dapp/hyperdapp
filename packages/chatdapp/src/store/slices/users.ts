import Moralis from "moralis";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../models/user.models";

interface IUsersSlice {
  isLoading: boolean;
  online: { [userId: string]: boolean };
  data: User[];
  error: string | undefined;
}

const initialState: IUsersSlice = {
  isLoading: false,
  online: {},
  data: [],
  error: undefined,
};

export const getOnlineUsers = createAsyncThunk(
  "users/getOnlineUsers",
  async () => {
    const users = await Moralis.Cloud.run("getOnlineUsers");
    const arr = users.map((user: any) => {
      const { id, attributes } = user;
      return { id, ...attributes };
    }) as User[];
    const map = arr
      .map((item) => item.id)
      .reduce((res, userId) => {
        return {
          ...res,
          [userId]: true,
        };
      }, {});
    return { arr, map };
  }
);

export const getUser = createAsyncThunk(
  "users/getUser",
  async (ethAddress: string) => {
    const user = await Moralis.Cloud.run("getUserByEthAddress", {
      ethAddress: ethAddress.toLowerCase(),
    });
    const { id, attributes } = user;
    return { id, ...attributes } as User;
  }
);

const slice = createSlice({
  name: "users",
  initialState,
  reducers: {
    updateOnlineUsersState(
      state,
      action: PayloadAction<{ [userId: string]: boolean }>
    ) {
      state.online = { ...state.online, ...action.payload };
    },
    resetOnlineUsersState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOnlineUsers.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getOnlineUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.error.message;
      })
      .addCase(getOnlineUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.arr;
        state.online = action.payload.map;
      })
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.online[action.payload.id] = action.payload.isOnline;
      });
  },
});

const { actions, reducer } = slice;
export const { updateOnlineUsersState, resetOnlineUsersState } = actions;
export default reducer;
