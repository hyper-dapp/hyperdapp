import Moralis from "moralis";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMoralisEntity, ChatPayload } from "../../models/chat.models";
import { getUser } from "./users";

const Chat = Moralis.Object.extend("Chat");

interface IChatsSlice {
  isLoading: boolean;
  data: ChatMoralisEntity[];
  error: string | undefined;
}

const initialState: IChatsSlice = {
  isLoading: true,
  data: [],
  error: undefined,
};

export const getChats = createAsyncThunk(
  "chats/getChats",
  async (payload: { userId: string; chainId: string }) => {
    const { userId, chainId } = payload;
    const query = new Moralis.Query("Chat");
    query.containsAll("users", [userId]);
    query.equalTo("chainId", chainId);
    query.select("createdBy", "name", "users", "type", "contractAddress");
    const results = await query.find();
    return results.map((chat) => {
      const { id, attributes } = chat;
      return { id, ...attributes };
    }) as ChatMoralisEntity[];
  }
);

export const saveChat = createAsyncThunk(
  "chats/saveChat",
  async (payload: ChatPayload) => {
    const chat = new Chat();
    return chat.save(payload);
  }
);

const slice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    updateChatsState(state, action: PayloadAction<ChatMoralisEntity>) {
      state.data = [action.payload, ...state.data];
    },
    resetChatsState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChats.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      });
  },
});

const { actions, reducer } = slice;
export const { updateChatsState, resetChatsState } = actions;
export default reducer;
