import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MoralisProvider } from "react-moralis";
import store from "./store/store";
import Login from "./routes/Login";
import Home from "./routes/Home/Home";
import ContractChatFeed from "./routes/Home/Chats/ContractChatFeed";
import RoomChatFeed from "./routes/Home/Chats/RoomChatFeed";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import FlowChatFeed from "./routes/Home/Chats/FlowChatFeed";

const appId = process.env["REACT_APP_MORALIS_APP_ID"] as string;
const serverUrl = process.env["REACT_APP_MORALIS_SERVER_URL"] as string;

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<Home />}>
                <Route path="/chat/:chatId" element={<RoomChatFeed />} />
                <Route
                  path="/contract/:contractId"
                  element={<ContractChatFeed />}
                />
                <Route path="/flow/:contractId" element={<FlowChatFeed />} />
                <Route
                  path="*"
                  element={
                    <main className="p-1">
                      <p>This chat doesn't exist!</p>
                    </main>
                  }
                />
              </Route>
              <Route path="/login" element={<Login />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
