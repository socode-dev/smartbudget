import { BrowserRouter as Router } from "react-router-dom";
import { useThemeEffect } from "./hooks/useThemeEffect";
import AppWrapper from "./routes/AppWrapper";
import AppRoutes from "./routes/AppRoutes";
import { AnimatePresence } from "framer-motion";

function App() {
  // Initialize and handle theme changes
  useThemeEffect();

  return (
    <Router>
      <AppWrapper>
        <AnimatePresence mode="wait">
          <AppRoutes />
        </AnimatePresence>
      </AppWrapper>
    </Router>
  );
}

export default App;
