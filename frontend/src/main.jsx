import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { CardProvider } from "../context/CardContext";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CardProvider>
      <App />
    </CardProvider>
  </BrowserRouter>
);
