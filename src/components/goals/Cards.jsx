import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import CircularProgress from "../ui/CircularProgress";
import { FaPlus } from "react-icons/fa";
import { useGoalsContext } from "../../context/GoalsContext";
import useCurrencyStore from "../../store/useCurrencyStore";
import { formatAmount } from "../../utils/formatAmount";

const Cards = () => {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const {
    filteredGoals,
    getAmountSaved,
    handleEditGoal,
    handleAddContribution,
    deleteGoalAndContribution,
  } = useGoalsContext();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Emergency Fund */}
      {filteredGoals.map((goal) => {
        const goalTargetAmount = goal.amount;
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
                  <h3 className="text-xl md:text-2xl font-semibold">
                    {goal.name}
                  </h3>
                  <p className="mt-4 text-base text-[rgb(var(--color-muted))] font-medium">
                    Target:{" "}
                    <strong>
                      {formatAmount(goalTargetAmount, selectedCurrency)}
                    </strong>
                  </p>
                  <p className="text-base text-[rgb(var(--color-muted))] font-medium">
                    Saved:{" "}
                    <strong>
                      {formatAmount(amountSaved, selectedCurrency)}
                    </strong>
                  </p>
                </div>
                {/* Progress bar */}
                <div className="flex items-center ">
                  <CircularProgress progress={contributionProgress} />
                </div>

                {/* Due date */}
                <p className="text-base text-[rgb(var(--color-muted))] font-medium">
                  Due date: <strong>{goal.date}</strong>
                </p>
              </div>

              {/* Edit and delete buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleEditGoal(goal.id)}
                  className="text-lg text-[rgb(var(--color-brand-deep))] hover:text-[rgb(var(--color-brand))] transition cursor-pointer"
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
              className="border-green-500 border bg-[rgb(var(--color-contribution-bg))] text-base font-semibold text-[rgb(var(--color-text))] px-4 py-1.5 md:py-2 rounded-md cursor-pointer hover:bg-green-500 hover:text-white transition flex justify-center items-center gap-2"
            >
              <FaPlus className="text-lg" />
              Add Contribution
            </button>
          </div>
        );
      })}
    </section>
  );
};

export default Cards;
