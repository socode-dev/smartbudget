import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App.jsx";
import "./components/charts/chartConfig/chartSetup";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt.jsx";
import { PWAUpdatePrompt } from "./components/pwa/PWAUpdatePrompt.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />

    <PWAInstallPrompt />
    <PWAUpdatePrompt />
  </StrictMode>
);
