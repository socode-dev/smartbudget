import { create } from "zustand";
import useCurrencyStore from "./useCurrencyStore";
import CURRENCY_SYMBOLS from "../data/currencySymbols";
import {
  addTransaction,
  getAllTransactions,
  deleteTransaction,
} from "../data/idbTransactions";
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
  setTransactions: (txs) => set({ transactions: txs }),
  loadTransactions: async () => {
    try {
      const txs = await getAllTransactions();
      set({ transactions: txs });
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      console.log("Loading transactions completed");
    }
  },
  deleteTransaction: async (id) => {
    await deleteTransaction(id);
    const txs = await getAllTransactions();
    set({ transactions: txs });
  },
  addTransactionToStore: async (transaction) => {
    const { setCategory, setType, setAmount, setDate, setDescription } = get();
    await addTransaction(transaction);
    // Reload from idb to ensure sync
    const txs = await getAllTransactions();
    set({ transactions: txs });
    toast.success("Expense added successfully", {
      duration: 3000,
      position: "top-center",
    });
    set({ category: "" });
    set({ type: "" });
    set({ amount: "" });
    set({ date: "" });
    set({ description: "" });
  },
  CATEGORY_OPTIONS,
  category: "",
  setCategory: (category) => set({ category }),
  amount: "",
  setAmount: (amount) => set({ amount }),
  date: new Date().toISOString().split("T")[0],
  setDate: (date) => set({ date }),
  description: "",
  setDescription: (description) => set({ description }),
  type: "income",
  setType: (type) => set({ type }),
  get selectedCurrency() {
    return useCurrencyStore.getState().selectedCurrency;
  },
  get currencySymbol() {
    const selectedCurrency = useCurrencyStore.getState().selectedCurrency;
    return CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;
  },
  isFormValid: () => {
    const { category, amount, date } = get();
    const parsedAmount = parseFloat(amount);
    const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
    const isDateValid = Boolean(date && !isNaN(Date.parse(date)));
    return Boolean(category && isAmountValid && isDateValid);
  },
  handleSave: async (e) => {
    e.preventDefault();
    const {
      category,
      amount,
      date,
      description,
      selectedCurrency,
      currencySymbol,
      addTransactionToStore,
      isFormValid,
      type,
    } = get();
    const formIsValid = isFormValid();

    const categoryType = CATEGORY_OPTIONS.find(
      (opt) => opt.name === category
    )?.type;

    try {
      if (formIsValid) {
        const transaction = {
          category,
          currencySymbol,
          currency: selectedCurrency,
          amount,
          type: categoryType === "other" ? type : categoryType,
          date,
          description: description || undefined,
        };
        await addTransactionToStore(transaction);
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      toast.error("Failed to add transaction. Please try again.");
    } finally {
      console.log("Transaction concluded");
    }
  },
}));

export default useTransactionStore;
