import GoalPagination from "./GoalPagination";
import GoalCard from "./GoalCard";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useGoalsContext } from "../../context/GoalsContext";
import useCurrencyStore from "../../store/useCurrencyStore";

const goalsPerPage = 6;

const Cards = () => {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const {
    filteredGoals,
    getAmountSaved,
    handleEditGoal,
    handleAddContribution,
    deleteGoalAndContribution,
  } = useGoalsContext();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGoals.length / goalsPerPage),
  );
  const currentPage = Math.min(page, totalPages);
  const pageGoals = filteredGoals.slice(
    (currentPage - 1) * goalsPerPage,
    currentPage * goalsPerPage,
  );

  const deleteGoal = async (goal) => {
    if (deletingId) return;
    setDeletingId(goal.id);

    try {
      await deleteGoalAndContribution(goal.id, goal.categoryKey);
    } catch {
      toast.error(
        "Could not finish deleting the goal. Please refresh and try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <section
        id="goal-cards"
        aria-label="Savings goals"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 min-[1280px]:grid-cols-3"
      >
        {pageGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            deletingId={deletingId}
            handleEditGoal={handleEditGoal}
            deleteGoal={deleteGoal}
            selectedCurrency={selectedCurrency}
            handleAddContribution={handleAddContribution}
            getAmountSaved={getAmountSaved}
          />
        ))}
      </section>
      {totalPages > 1 && (
        <GoalPagination
          currentPage={currentPage}
          setPage={setPage}
          totalPages={totalPages}
          filteredGoals={filteredGoals}
        />
      )}
    </div>
  );
};

export default Cards;
