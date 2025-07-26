// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App.jsx";
import { NuqsAdapter } from "nuqs/adapters/react";
import "./components/charts/chartConfig/chartSetup";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <NuqsAdapter>
    <App />
  </NuqsAdapter>
  // </StrictMode>
);
