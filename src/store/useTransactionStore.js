import { create } from "zustand";
import useCurrencyStore from "./useCurrencyStore";
// import idbTransactions from "../store/idbTransactions";
import { toast } from "react-hot-toast";
import {
  addTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
} from "../firebase/firestore.js";

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
  loading: true,
  setLoading: (value) => set({ loading: value }),
  setTransactions: (transactions) => set({ transactions }),
  setBudgets: (budgets) => set({ budgets }),
  setGoals: (goals) => set({ goals }),
  setContributions: (contributions) => set({ contributions }),
  setEditTransaction: (editTransaction) => set({ editTransaction }),
  // Load transactions from firestore
  loadTransactions: async (userID, type) => {
    try {
      const txs = await getAllTransactions(userID, type);
      set({ [type]: txs });
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      return "Loading transactions completed";
    }
  },

  // Delete transaction from firestore
  deleteTransaction: async (userID, type, transactionID) => {
    await deleteTransaction(userID, type, transactionID);
    const txs = await getAllTransactions(userID, type);
    set({ [type]: txs });
  },

  // Add transaction to firestore
  addTransactionToStore: async (userID, type, transaction) => {
    await addTransaction(userID, type, transaction);
    // Reload transactions from firestore to ensure sync
    const txs = await getAllTransactions(userID, type);
    set({ [type]: txs });
  },

  // Update transaction in firestore
  updateTransaction: async (userID, type, transactionID, transaction) => {
    await updateTransaction(userID, type, transactionID, transaction);
    // Reload transaction from firestore to ensure sync
    const txs = await getAllTransactions(userID, type);
    set({ [type]: txs });
  },

  CATEGORY_OPTIONS,
}));

export default useTransactionStore;
