import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { createLogger } from "redux-logger";
import users from "./slices/users";
import contracts from "./slices/contracts";
import flows from "./slices/flows";
import chats from "./slices/chats";
import messages from "./slices/messages";

const loggerMiddleware = createLogger();

export const store = configureStore({
  reducer: {
    users,
    contracts,
    flows,
    chats,
    messages,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    }).concat(loggerMiddleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
