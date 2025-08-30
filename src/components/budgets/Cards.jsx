import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import clsx from "clsx";
import { format } from "date-fns";
import { useBudgetsContext } from "../../context/BudgetsContext";
import { useTransactionsContext } from "../../context/TransactionsContext";

const Cards = () => {
  const { formattedAmount } = useTransactionsContext();
  const {
    filteredBudgets,
    getAmountSpent,
    getProgressBackground,
    handleEditBudget,
    handleDeleteBudget,
  } = useBudgetsContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredBudgets.map((budget) => {
        const monthLabel = format(new Date(budget.date), "MMMM yyyy");
        const budgetLimit = budget.amount;
        const amountSpent = getAmountSpent(budget.categoryKey, budget.date);
        const remainingBalance = budgetLimit - amountSpent;
        const progressBarPercentage = (amountSpent / budgetLimit) * 100;
        const progressBarBackground = getProgressBackground(
          progressBarPercentage,
          budget.type
        );

        return (
          <div
            key={budget.id}
            className="bg-[rgb(var(--color-bg-card))] h-50 p-4 rounded-lg flex justify-between items-start gap-4"
          >
            <div className="flex flex-col grow h-full space-y-1.5">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">
                  {budget.category.toLowerCase() === "other"
                    ? budget.name
                    : budget.category}
                </h3>
                <p className="text-gray-500 bg-[rgb(var(--color-bg))] text-sm font-medium w-fit py-0.5 px-2 rounded mt-1">
                  {monthLabel}
                </p>
              </div>

              {/* Budget summary */}
              <div className="grow w-full">
                <p className="text-[rgb(var(--color-muted))] text-base font-medium">
                  Limit:{" "}
                  <strong className="text-[rgb(var(--color-muted))]">
                    {formattedAmount(budgetLimit)}
                  </strong>
                </p>
                {budget.type === "expense" && (
                  <p className="text-[rgb(var(--color-muted))] text-base font-medium">
                    Spent:{" "}
                    <strong className="text-[rgb(var(--color-muted))]">
                      {formattedAmount(amountSpent)}
                    </strong>
                  </p>
                )}
                <p className="text-[rgb(var(--color-muted))] text-base font-medium">
                  {progressBarPercentage > 100 && budget.type === "expense"
                    ? "Overspent"
                    : progressBarPercentage > 100 && budget.type === "income"
                    ? "Extra"
                    : "Remaining"}
                  :{" "}
                  <strong
                    className={clsx(
                      "text-[rgb(var(--color-muted))]",
                      progressBarPercentage > 100 &&
                        budget.type === "income" &&
                        "text-green-600",
                      progressBarPercentage > 100 &&
                        budget.type === "expense" &&
                        "text-red-600"
                    )}
                  >
                    {progressBarPercentage > 100
                      ? `${
                          budget.type === "income" ? "+" : "-"
                        }${formattedAmount(Math.abs(remainingBalance))}`
                      : formattedAmount(remainingBalance)}
                  </strong>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[rgb(var(--color-gray-border))] rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressBarBackground} rounded-full transition-all duration-500 ease-in-out`}
                  style={{
                    width: `${progressBarPercentage}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="text-sm text-[rgb(var(--color-brand-deep))] hover:text-[rgb(var(--color-brand))] transition cursor-pointer"
                onClick={() => handleEditBudget(budget.id)}
              >
                <HiOutlinePencil className="text-lg" />
              </button>
              <button
                onClick={() => handleDeleteBudget(budget.id)}
                className="text-sm text-red-500 hover:text-red-600 transition cursor-pointer"
              >
                <HiOutlineTrash className="text-lg" />
              </button>
            </div>
          </div>
        );
      })}

      {/* End of Budgets */}
    </div>
  );
};

export default Cards;
