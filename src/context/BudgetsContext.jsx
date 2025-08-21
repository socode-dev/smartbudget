import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import useTransactionStore from "../store/useTransactionStore";
import { useFormContext } from "./FormContext";
import { useModalContext } from "./ModalContext";
import { handleEdit } from "../utils/handleEdit";
import { checkBudgetThreshold } from "../firebase/checkBudgetThreshold";
import { useAuthContext } from "./AuthContext";
import { useTransactionsContext } from "./TransactionsContext";

const BudgetsContext = createContext();

export const BudgetsProvider = ({ children }) => {
  const { currentUser } = useAuthContext();
  const [searchName, setSearchName] = useState("");
  const { onOpenModal, setTransactionID } = useModalContext();
  const { budgets, transactions, deleteTransaction, setEditTransaction } =
    useTransactionStore();
  const { formattedAmount } = useTransactionsContext();
  const forms = useFormContext("budgets");
  const { setValue } = forms;

  const filteredBudgets = useMemo(
    () =>
      budgets.filter((budget) => {
        const matchesName =
          searchName === ""
            ? true
            : budget?.name?.toLowerCase().includes(searchName?.toLowerCase());

        return matchesName;
      }),
    [budgets, searchName]
  );

  const getAmountSpent = useCallback(
    (key, date) => {
      const budgetDate = new Date(date);
      const spendingRecords = transactions.filter(
        (tx) =>
          tx.categoryKey === key &&
          new Date(tx.date).getMonth() === budgetDate.getMonth() &&
          new Date(tx.date).getFullYear() === budgetDate.getFullYear()
      );

      return spendingRecords.reduce((acc, tx) => acc + tx.amount, 0);
    },
    [transactions]
  );

  const budgetCounts = budgets.length;
  const transactionCounts = transactions.length;

  useEffect(() => {
    if (!currentUser?.uid || budgetCounts === 0) return;

    // Debounce notification to avoid firing multiple time during quick updates
    const timeout = setTimeout(() => {
      checkBudgetThreshold(
        currentUser.uid,
        budgets,
        transactions,
        getAmountSpent,
        formattedAmount
      ).catch((error) =>
        console.error("Error generating notifications:", error)
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [currentUser.uid, budgetCounts, transactionCounts]);

  const handleEditBudget = (id) => {
    handleEdit(
      id,
      "budgets",
      "edit",
      budgets,
      setValue,
      onOpenModal,
      setEditTransaction
    );
    setTransactionID(id);
  };

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id, "budgets");
  };

  const getProgressBackground = (percentage, type) => {
    if (percentage > 90 && type === "expense") {
      return "bg-red-500";
    } else if (percentage > 90 && type === "income") {
      return "bg-green-500";
    } else if (percentage > 50 && type !== "income") {
      return "bg-amber-500";
    } else {
      return "bg-[rgb(var(--color-brand-deep))]";
    }
  };

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        filteredBudgets,
        searchName,
        setSearchName,
        getAmountSpent,
        getProgressBackground,
        onOpenModal,
        handleEditBudget,
        handleDeleteTransaction,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};

export const useBudgetsContext = () => useContext(BudgetsContext);
