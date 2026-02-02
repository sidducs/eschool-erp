import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <ToastProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ToastProvider>
  </AuthProvider>
);
