import Moralis from "moralis";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MessageModel,
  MessageMoralisEntity,
} from "../../models/message.models";

const Message = Moralis.Object.extend("Message");

interface Messages {
  isLoading: boolean;
  chatId: string;
  data: Array<MessageMoralisEntity | MessageModel>;
}

interface IMessagesSlice {
  [chatId: string]: Messages;
}

const initialState: IMessagesSlice = {};

export const getMessages = createAsyncThunk(
  "messages/getMessages",
  async (chatId: string) => {
    const results = await Moralis.Cloud.run("getChatMessages", { chatId });
    const messages = results.map((message: any) => {
      const { id, attributes } = message;
      const { from, ...messageAttributes } = attributes;
      const { id: userId, attributes: userAttributes } = from;
      return {
        id,
        from: { id: userId, ...userAttributes },
        ...messageAttributes,
      };
    }) as MessageMoralisEntity[];
    return { chatId, messages };
  }
);

export const saveMessage = createAsyncThunk(
  "messages/saveMessage",
  async (payload: MessageModel) => {
    const message = new Message();
    return message.save(payload);
  }
);

const chatMessages = createSlice({
  name: "messages",
  initialState,
  reducers: {
    sendMessage(state, action: PayloadAction<MessageModel>) {
      const { chatId } = action.payload;
      if (state[chatId]?.data) {
        state[chatId].data = [...state[chatId].data, action.payload];
      }
    },
    setMessagesState(state, action: PayloadAction<Messages>) {
      const { chatId } = action.payload;
      state[chatId] = action.payload;
    },
    initMessagesState(state, action: PayloadAction<string>) {
      const chatId = action.payload;
      state[chatId] = {
        isLoading: false,
        chatId,
        data: [],
      };
    },
    resetMessagesState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMessages.fulfilled, (state, action) => {
      const { chatId, messages } = action.payload;
      state[chatId] = {
        isLoading: false,
        chatId,
        data: messages,
      };
    });
  },
});

const { actions, reducer } = chatMessages;
export const {
  initMessagesState,
  sendMessage,
  setMessagesState,
  resetMessagesState,
} = actions;
export default reducer;
