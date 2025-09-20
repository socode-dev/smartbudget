import { useEffect } from "react";
import useThemeStore from "../store/useThemeStore";

export const useThemeEffect = () => {
  const theme = useThemeStore((state) => state.theme);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

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
