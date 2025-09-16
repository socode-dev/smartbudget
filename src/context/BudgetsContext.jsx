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
import { checkBudgetThreshold } from "../services/checkBudgetThreshold";
import useThresholdStore from "../store/useThresholdStore";
import { scheduleThresholdCheck } from "../services/scheduleThresholdCheck";
import useAuthStore from "../store/useAuthStore";

const BudgetsContext = createContext();

export const BudgetsProvider = ({ children }) => {
  const { currentUser: user } = useAuthStore();
  const { thresholds } = useThresholdStore();
  const [searchName, setSearchName] = useState("");
  const { onOpenModal, setTransactionID } = useModalContext();
  const { budgets, transactions, deleteTransaction, setEditTransaction } =
    useTransactionStore();
  const forms = useFormContext("budgets");
  const { setValue } = forms;

  const budgetThreshold50 = thresholds?.budgetThreshold50 ?? 50;
  const budgetThreshold80 = thresholds?.budgetThreshold80 ?? 80;
  const budgetThreshold100 = thresholds?.budgetThreshold100 ?? 100;

  const filteredBudgets = useMemo(
    () =>
      budgets?.filter((budget) => {
        const matchesName =
          searchName === ""
            ? true
            : budget?.name?.toLowerCase().includes(searchName?.toLowerCase());

        return matchesName;
      }),
    [budgets, searchName]
  );

  const budgetCounts = budgets?.length;
  const transactionCounts = transactions?.length;

  useEffect(() => {
    // if (!currentUser?.uid || budgetCounts === 0) return;
    let mounted = true;
    let lastRunKey = null;

    const runKey = `${user?.uid || "nouser"}|b:${budgetCounts || 0}|t:${
      transactionCounts || 0
    }`;

    if (user?.uid && (budgetCounts || 0) > 0) {
      if (lastRunKey !== runKey) {
        lastRunKey = runKey;
        scheduleThresholdCheck(
          mounted,
          checkBudgetThreshold,
          user.uid,
          budgets,
          budgetThreshold50,
          budgetThreshold80,
          budgetThreshold100
        );
      } else {
        console.log("Skipping duplicate budget-check run");
      }
    }

    return () => {
      mounted = false;
    };
  }, [user?.uid, budgets, transactions]);

  const handleEditBudget = (id) => {
    handleEdit(
      id,
      "budgets",
      "edit",
      setValue,
      onOpenModal,
      setEditTransaction
    );
    setTransactionID(id);
  };

  const handleDeleteBudget = (id) => {
    deleteTransaction(user.uid, "budgets", id);
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
        getProgressBackground,
        onOpenModal,
        handleEditBudget,
        handleDeleteBudget,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};

export const useBudgetsContext = () => useContext(BudgetsContext);
