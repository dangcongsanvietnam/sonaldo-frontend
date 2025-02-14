import React from "react";
import ReactDOM from "react-dom/client";
import AppMain from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { App } from "antd";
import { LoadingProvider } from "./provider/LoadingProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LoadingProvider>
    <GoogleOAuthProvider clientId="156583417941-6m71jhteinga9ik2djqisifcd79i8uq0.apps.googleusercontent.com">
      {/* <React.StrictMode> */}
      <Provider store={store}>
        <BrowserRouter>
          <App>
            <AppMain />
          </App>
        </BrowserRouter>
      </Provider>
      {/* </React.StrictMode> */}
    </GoogleOAuthProvider>
  </LoadingProvider>
);
