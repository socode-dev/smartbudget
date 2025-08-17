import { create } from "zustand";
import useCurrencyStore from "./useCurrencyStore";
// import idbTransactions from "../store/idbTransactions";
import { toast } from "react-hot-toast";
import {
  addDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
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

const useTransactionStore = create((set) => ({
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
  loadTransactions: async (userUID, type) => {
    try {
      const txs = await getAllDocuments(userUID, type);
      set({ [type]: txs });
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      return "Loading transactions completed";
    }
  },

  // Delete transaction from firestore
  deleteTransaction: async (userUID, type, transactionID) => {
    await deleteDocument(userUID, type, transactionID);
    const txs = await getAllDocuments(userUID, type);
    set({ [type]: txs });
  },

  // Add transaction to firestore
  addTransactionToStore: async (userUID, type, transaction) => {
    await addDocument(userUID, type, transaction);
    // Reload transactions from firestore to ensure sync
    const txs = await getAllDocuments(userUID, type);
    set({ [type]: txs });
  },

  // Update transaction in firestore
  updateTransaction: async (userUID, type, transactionID, transaction) => {
    await updateDocument(userUID, type, transactionID, transaction);
    // Reload transaction from firestore to ensure sync
    const txs = await getAllDocuments(userUID, type);
    set({ [type]: txs });
  },

  CATEGORY_OPTIONS,
}));

export default useTransactionStore;
