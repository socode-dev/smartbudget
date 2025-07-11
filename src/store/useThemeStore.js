import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      // toggleTheme: () =>
      //   set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      // setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          document.documentElement.classList.toggle(
            "dark",
            newTheme === "dark"
          );
          return { theme: newTheme };
        });
      },
    }),
    {
      name: "theme-storage", // name of the item in storage
    }
  )
);

export default useThemeStore;
