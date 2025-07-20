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
  editBudget: null,
  editGoal: null,
  editContribution: null,
  setTransactions: (transactions) => set({ transactions }),
  setEditTransaction: (editTransaction) => set({ editTransaction }),
  setBudgets: (budgets) => set({ budgets }),
  setEditBudget: (editBudget) => set({ editBudget }),
  setGoals: (goals) => set({ goals }),
  setEditGoal: (editGoal) => set({ editGoal }),
  setContributions: (contributions) => set({ contributions }),
  setEditContribution: (editContribution) => set({ editContribution }),
  loadTransactions: async (label) => {
    try {
      const { getAllTransactions } = idbTransactions(label);
      const txs = await getAllTransactions(label);
      set({ [label]: txs });
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      console.log("Loading transactions completed");
    }
  },
  deleteTransaction: async (id, label) => {
    const { deleteTransaction, getAllTransactions } = idbTransactions(label);
    await deleteTransaction(id, label);
    const txs = await getAllTransactions(label);
    set({ [label]: txs });
  },
  clearTransactions: async (label) => {
    const { clearTransactions, getAllTransactions } = idbTransactions(label);
    await clearTransactions(label);
    const txs = await getAllTransactions(label);
    set({ [label]: [] });
  },
  addTransactionToStore: async (transaction, label) => {
    const { addTransaction, getAllTransactions } = idbTransactions(label);
    await addTransaction(transaction, label);
    // Reload from idb to ensure sync
    const txs = await getAllTransactions(label);
    set({ [label]: txs });
  },
  updateTransaction: async (transaction, label) => {
    const { updateTransaction, getAllTransactions } = idbTransactions(label);
    await updateTransaction(transaction, label);
    const txs = await getAllTransactions(label);
    set({ [label]: txs });
  },
  CATEGORY_OPTIONS,
  get selectedCurrency() {
    return useCurrencyStore.getState().selectedCurrency;
  },
  get currencySymbol() {
    const selectedCurrency = useCurrencyStore.getState().selectedCurrency;
    return CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;
  },
}));

export default useTransactionStore;
