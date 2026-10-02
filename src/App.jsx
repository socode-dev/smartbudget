import { BrowserRouter as Router } from "react-router-dom";
import { useThemeEffect } from "./hooks/useThemeEffect";
import AppWrapper from "./routes/AppWrapper";
import AppRoutes from "./routes/AppRoutes";
import { AnimatePresence } from "framer-motion";

function App() {
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
