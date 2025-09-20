import { useEffect } from "react";
import useThemeStore from "../store/useThemeStore";

export const useThemeEffect = () => {
  const { theme, initializeTheme } = useThemeStore.getState();

  useEffect(() => {
    // Initialize theme on mount
    initializeTheme();
  }, []);

  useEffect(() => {
    // Apply theme changes to DOM
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
};
