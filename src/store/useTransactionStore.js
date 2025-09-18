import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import {
  addDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
} from "../firebase/firestore.js";
import { CATEGORY_OPTIONS } from "../data/categoryData.js";

const useTransactionStore = create(
  persist(
    (set) => ({
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
        set((state) => ({
          [type]: state[type]?.filter((record) => record.id !== transactionID),
        }));
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

      clearFinanceStore: () => {
        set({ transactions: [], budgets: [], goals: [], contributions: [] });
      },

      CATEGORY_OPTIONS,
    }),
    {
      name: "finances-storage",
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        contributions: state.contributions,
      }),
    }
  )
);

export default useTransactionStore;
