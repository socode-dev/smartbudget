import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useModalContext } from "./ModalContext";
import { useFormContext } from "./FormContext";
import useTransactionStore from "../store/useTransactionStore";
import { handleEdit } from "../utils/handleEdit";
import toast from "react-hot-toast";
import { checkGoalThreshold } from "../services/checkGoalThreshold";
import useThresholdStore from "../store/useThresholdStore";
import { scheduleThresholdCheck } from "../services/scheduleThresholdCheck";
import useAuthStore from "../store/useAuthStore";

const GoalsContext = createContext();

export const GoalsProvider = ({ children }) => {
  const { currentUser: user } = useAuthStore();
  const { thresholds } = useThresholdStore();
  const { onOpenModal, modalState, setTransactionID } = useModalContext();
  const contributionModalState = modalState.contributions;
  const { goals, contributions, deleteTransaction, setEditTransaction } =
    useTransactionStore();
  const [searchName, setSearchName] = useState("");

  const goalThreshold50 = thresholds?.goalThreshold50 ?? 50;
  const goalThreshold80 = thresholds?.goalThreshold80 ?? 80;
  const goalThreshold100 = thresholds?.goalThreshold100 ?? 100;

  // Goal form
  const goalForm = useFormContext("goals");
  const { setValue: setGoalValue } = goalForm;
  // Contribution form
  const contributionForm = useFormContext("contributions");
  const { setValue: setContributionValue, reset, getValues } = contributionForm;

  // Set the value of contribution name to the clicked goal name
  useEffect(() => {
    if (contributionModalState.open && contributionModalState.meta?.goalName) {
      setContributionValue("name", contributionModalState.meta.goalName);
    }

    // Cleanup to prevent memory leak
    return () => {
      reset();
    };
  }, [contributionModalState.open, contributionModalState.meta?.name]);

  // Open contribution modal
  const handleAddContribution = (id, label, name) => {
    onOpenModal(label, "add", { goalId: id, goalName: name });
  };

  // Handler for goal editing
  const handleEditGoal = (id) => {
    handleEdit(
      id,
      "goals",
      "edit",
      setGoalValue,
      onOpenModal,
      setEditTransaction
    );
    setTransactionID(id);
  };

  const getAmountSaved = useCallback(
    (key) => {
      const amountSaved = contributions?.filter(
        (contribution) => contribution.categoryKey === key
      );
      return amountSaved.reduce((acc, tx) => acc + tx.amount, 0);
    },
    [contributions]
  );

  const goalCounts = goals?.length;
  const contributionCounts = contributions?.length;

  useEffect(() => {
    // if (!currentUser?.uid || goalCounts === 0) return;
    let mounted = true;
    let lastRunKey = null;

    const runKey = `${user?.uid || "nouser"}|g:${goalCounts || 0}|c:${
      contributionCounts || 0
    }`;

    if (user?.uid && (goalCounts || 0) > 0) {
      if (lastRunKey !== runKey) {
        lastRunKey = runKey;
        scheduleThresholdCheck(
          mounted,
          checkGoalThreshold,
          user.uid,
          goals,
          getAmountSaved,
          goalThreshold50,
          goalThreshold80,
          goalThreshold100
        );
      } else {
        console.log("Skipping duplicate budget-check run");
      }
    }

    return () => {
      mounted = false;
    };
  }, [user?.uid, goalCounts, contributionCounts]);

  const filteredGoals = useMemo(
    () =>
      goals?.filter((goal) => {
        const matchesName =
          searchName === ""
            ? true
            : goal?.name?.toLowerCase().includes(searchName?.toLowerCase());

        return matchesName;
      }),
    [goals, searchName]
  );

  // Handler to delete goal and its contributions(if any)
  const deleteGoalAndContribution = useCallback(
    (id, key) => {
      const goalContributions = contributions?.filter(
        (contribution) => contribution.categoryKey === key
      );

      if (goalContributions.length > 0) {
        for (let i = 0; i < goalContributions?.length; i++) {
          for (const contribution of goalContributions) {
            deleteTransaction(user.uid, "contributions", contribution.id);
          }
        }
        deleteTransaction(user.uid, "goals", id);
      } else {
        deleteTransaction(user.uid, "goals", id);
      }

      setTimeout(() => {
        toast.success("Goal deleted successfuly", { duration: 3000 });
      }, 500);
    },
    [contributions]
  );

  return (
    <GoalsContext.Provider
      value={{
        goals,
        filteredGoals,
        onOpenModal,
        searchName,
        setSearchName,
        getAmountSaved,
        handleEditGoal,
        handleAddContribution,
        deleteGoalAndContribution,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoalsContext = () => useContext(GoalsContext);
