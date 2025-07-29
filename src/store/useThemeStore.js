import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          return { theme: newTheme };
        });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      // Initialize theme on app load
      initializeTheme: () => {
        const { theme } = get();
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    {
      name: "theme-storage", // name of the item in storage
    }
  )
);

export default useThemeStore;
