import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { MoralisProvider } from "react-moralis";
import PrimeReact from "primereact/api";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";
import store from "./store/store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID as string;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL as string;

PrimeReact.appendTo = "self";

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <Provider store={store}>
        <App />
      </Provider>
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
