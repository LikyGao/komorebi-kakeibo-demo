import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = window.localStorage.getItem(key);
      return value == null ? null : { key, value };
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
      return { key, value };
    },
  };
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
