import { BrowserRouter as Router } from "react-router-dom";
import { useThemeEffect } from "./hooks/useThemeEffect";
import AppWrapper from "./routes/AppWrapper";
import AppRoutes from "./routes/AppRoutes";

function App() {
  // Initialize and handle theme changes
  useThemeEffect();

  return (
    <Router>
      <AppWrapper>
        <AppRoutes />
      </AppWrapper>
    </Router>
  );
}

export default App;
