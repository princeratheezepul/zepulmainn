import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// NOTE: Bootstrap's CSS is imported inside index.css via `@import ... layer(bootstrap)`
// so it sits in a cascade layer below Tailwind's utilities (otherwise Bootstrap's
// unlayered Reboot rules override Tailwind utility classes on h1/p/a/etc.).
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "./styles/MobileResponsive.css"
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
