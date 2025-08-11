import { create } from "zustand";
import useCurrencyStore from "./useCurrencyStore";
import CURRENCY_SYMBOLS from "../data/currencySymbols";
import idbTransactions from "../store/idbTransactions";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = [
  { name: "Freelance", type: "income" },
  { name: "Salary", type: "income" },
  { name: "Investments", type: "expense" },
  { name: "Gifts", type: "expense" },
  { name: "Loan", type: "expense" },
  { name: "Groceries", type: "expense" },
  { name: "Transport", type: "expense" },
  { name: "Dining", type: "expense" },
  { name: "Shopping", type: "expense" },
  { name: "Utilities", type: "expense" },
  { name: "Health", type: "expense" },
  { name: "Entertainment", type: "expense" },
  { name: "Other", type: "other" },
];

const useTransactionStore = create((set, get) => ({
  transactions: [],
  budgets: [],
  goals: [],
  contributions: [],
  editTransaction: null,
  setTransactions: (transactions) => set({ transactions }),
  setBudgets: (budgets) => set({ budgets }),
  setGoals: (goals) => set({ goals }),
  setContributions: (contributions) => set({ contributions }),
  setEditTransaction: (editTransaction) => set({ editTransaction }),

  // Load transactions from idb
  loadTransactions: async (label) => {
    try {
      const { getAllTransactions } = idbTransactions(label);
      const txs = await getAllTransactions(label);
      set({ [label]: txs });
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      return "Loading transactions completed";
    }
  },

  // Delete transaction from idb
  deleteTransaction: async (id, label) => {
    const { deleteTransaction, getAllTransactions } = idbTransactions(label);
    await deleteTransaction(id, label);
    const txs = await getAllTransactions(label);
    set({ [label]: txs });
  },

  // Clear transactions from idb
  clearTransactions: async (label) => {
    const { clearTransactions, getAllTransactions } = idbTransactions(label);
    await clearTransactions(label);
    const txs = await getAllTransactions(label);
    set({ [label]: txs });
  },

  // Add transaction to idb
  addTransactionToStore: async (transaction, label) => {
    const { addTransaction, getAllTransactions } = idbTransactions(label);
    await addTransaction(transaction, label);
    // Reload from idb to ensure sync
    const txs = await getAllTransactions(label);
    set({ [label]: txs });
  },

  // Update transaction in idb
  updateTransaction: async (transaction, label) => {
    const { updateTransaction, getAllTransactions } = idbTransactions(label);
    await updateTransaction(transaction, label);
    // Reload from idb to ensure sync
    const txs = await getAllTransactions(label);
    set({ [label]: txs });
  },

  CATEGORY_OPTIONS,

  // Get the user's selected currency
  get selectedCurrency() {
    return useCurrencyStore.getState().selectedCurrency;
  },
  // Get currency symbol
  get currencySymbol() {
    const selectedCurrency = useCurrencyStore.getState().selectedCurrency;
    return CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;
  },
}));

export default useTransactionStore;
