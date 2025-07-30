import { useCallback, useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import CircularProgress from "../components/ui/CircularProgress";
import { useModalContext } from "../context/ModalContext";
import useTransactionStore from "../store/useTransactionStore";
import { useFormContext } from "../context/FormContext";
import toast from "react-hot-toast";
import { handleEdit } from "../utils/handleEdit";

const Goals = () => {
  const { onOpenModal, modalState } = useModalContext();
  const contributionModalState = modalState.contributions;
  const { goals, contributions, deleteTransaction, setEditTransaction } =
    useTransactionStore();
  const [searchName, setSearchName] = useState("");

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
      goals,
      setGoalValue,
      onOpenModal,
      setEditTransaction
    );
  };

  const getAmountSaved = useCallback(
    (key) => {
      const amountSaved = contributions.filter(
        (contribution) => contribution.categoryKey === key
      );
      return amountSaved.reduce((acc, tx) => acc + tx.amount, 0);
    },
    [contributions]
  );

  const filteredGoals = goals.filter((goal) => {
    const matchesName =
      searchName === ""
        ? true
        : goal?.name?.toLowerCase().includes(searchName?.toLowerCase());

    return matchesName;
  });

  // Handler to delete goal and its contributions(if any)
  const deleteGoalAndContribution = useCallback(
    (id, key) => {
      const goalContributions = contributions.filter(
        (contribution) => contribution.categoryKey === key
      );
      if (goalContributions.length > 0) {
        for (let i = 0; i < goalContributions?.length; i++) {
          for (const contribution of goalContributions) {
            deleteTransaction(contribution.id, "contributions");
          }
        }
        deleteTransaction(id, "goals");
      } else {
        deleteTransaction(id, "goals");
      }

      setTimeout(() => {
        toast.success("Goal deleted successfuly", { duration: 3000 });
      }, 50);
    },
    [contributions]
  );

  return (
    <main className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Goals</h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-6">
        Stay focused on what you are saving for.
      </p>

      {/* Search bar to search goal by name */}
      <input
        type="text"
        placeholder="Search by name..."
        className="w-full mx-auto mb-10 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Emergency Fund */}
        {filteredGoals.map((goal) => {
          const goalTargetAmount = goal.amount.toFixed(2);
          const amountSaved = getAmountSaved(goal.categoryKey);
          const contributionProgress = (amountSaved / goalTargetAmount) * 100;

          return (
            <div
              key={goal.id}
              className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg flex flex-col gap-6"
            >
              {/* Goal details */}
              <div className="grow shrink-0 flex justify-between items-start gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 grow">
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <p className="text-sm text-[rgb(var(--color-muted))]">
                      Target:{" "}
                      <strong>
                        {goal.currencySymbol}
                        {goalTargetAmount}
                      </strong>
                    </p>
                    <p className="text-sm text-[rgb(var(--color-muted))]">
                      Saved:{" "}
                      <strong>
                        {goal.currencySymbol}
                        {amountSaved.toFixed(2)}
                      </strong>
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center ">
                    <CircularProgress progress={contributionProgress} />
                  </div>

                  {/* Due date */}
                  <p className="text-sm text-[rgb(var(--color-muted))]">
                    Due date: <strong>{goal.date}</strong>
                  </p>
                </div>

                {/* Edit and delete buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => handleEditGoal(goal.id)}
                    className="text-lg text-blue-500 hover:text-blue-600 transition cursor-pointer"
                  >
                    <HiOutlinePencil />
                  </button>
                  <button
                    onClick={() =>
                      deleteGoalAndContribution(goal.id, goal.categoryKey)
                    }
                    className="text-lg text-red-500 hover:text-red-600 transition cursor-pointer"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>

              {/* Add contribution button */}
              <button
                onClick={() =>
                  handleAddContribution(goal.id, "contributions", goal.name)
                }
                className="border-green-500 border bg-[rgb(var(--color-contribution-bg))] text-sm font-medium text-[rgb(var(--color-text))] px-4 py-1.5 md:py-2 rounded-md cursor-pointer hover:bg-green-500 hover:text-white transition flex justify-center items-center gap-2"
              >
                <HiOutlinePlus />
                Add Contribution
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state if goal searched does not exist */}
      {filteredGoals?.length === 0 && goals.length > 0 && (
        <p className="text-center text-base text-[rgb(var(--color-muted))] mb-6">
          The goal you are looking for does not exist.
        </p>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="mt-6 flex flex-col items-center w-full">
          <p className="text-base text-[rgb(var(--color-muted))] mb-6">
            You have not set any financial goals yet. Start saving
            intentionally.
          </p>
        </div>
      )}
      <button
        onClick={() => onOpenModal("goals", "add")}
        className={`mt-10 ${
          !filteredGoals?.length && "mx-auto"
        } bg-blue-500 hover:bg-blue-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2`}
      >
        <HiOutlinePlus />
        <span>{goals.length === 0 ? "Add Your First Goal" : "Add Goal"}</span>
      </button>
    </main>
  );
};

export default Goals;
