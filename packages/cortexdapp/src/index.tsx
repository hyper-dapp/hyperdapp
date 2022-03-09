import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { MoralisProvider } from "react-moralis";
import PrimeReact from "primereact/api";
import "react-toastify/dist/ReactToastify.min.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";
import store from "./store/store";
import Home from "./routes/Home";
import Cortex from "./routes/Cortex/Cortex";
import CortexContracts from "./routes/Cortex/CortexContracts";
import CortexVariables from "./routes/Cortex/CortexVariables";
import CortexEditor from "./routes/Cortex/CortexEditor";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID as string;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL as string;

PrimeReact.appendTo = "self";

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route path="/home" element={<Home />} />
              <Route path="/cortex/:cortexId" element={<Cortex />}>
                <Route
                  path="/cortex/:cortexId/contracts"
                  element={<CortexContracts />}
                />
                <Route
                  path="/cortex/:cortexId/variables"
                  element={<CortexVariables />}
                />
                <Route
                  path="/cortex/:cortexId/editor"
                  element={<CortexEditor />}
                />
                <Route
                  path="*"
                  element={
                    <main className="p-1">
                      <p>This Cortex ID doesn't exist!</p>
                    </main>
                  }
                />
              </Route>
              <Route path="/" element={<Navigate to="/home" />} />
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
