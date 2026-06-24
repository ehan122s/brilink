import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initializeNativeApp } from "./lib/nativeApp";
import "./styles/app.css";

initializeNativeApp();

function getRouterBasename() {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (window.location.hostname.endsWith("github.io")) {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);

    if (pathSegments[0] === "brilink") {
      return "/brilink";
    }
  }

  return undefined;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={getRouterBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
