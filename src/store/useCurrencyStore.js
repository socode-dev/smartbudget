import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useCurrencyStore = create(
  persist(
    (set) => ({
      currencies: [],
      selectedCurrency: "USD",
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
      fetchCurrencies: async () => {
        try {
          // Using exchangerate-api.com for free currency codes
          const res = await axios.get("https://open.er-api.com/v6/latest/USD");
          const codes = Object.keys(res.data.rates);
          set({ currencies: codes });
        } catch (error) {
          set({ currencies: ["USD", "EUR", "NGN"] }); // fallback
        }
      },
    }),
    {
      name: "currency-storage",
    }
  )
);

export default useCurrencyStore;
