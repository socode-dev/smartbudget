import { useOverviewContext } from "../../context/OverviewContext";
import clsx from "clsx";

const IncomeBudgetOverview = () => {
  const {
    totalIncomeBudget,
    incomeBudgetPercent,
    remainingIncome,
    currencySymbol,
  } = useOverviewContext();

  const budgetPercent = incomeBudgetPercent || 0;

  const dynamicIncomeRingBG = {
    background: `conic-gradient(${
      budgetPercent >= 100 ? "rgb(34, 197, 94)" : "rgb(37 99 235)"
    } 0% ${Math.ceil(budgetPercent)}%, rgb(229 231 235) ${Math.ceil(
      budgetPercent
    )}% 100%)`,
  };

  let incomeStatus = "";
  let incomeTooltip = "";

  if (!incomeBudgetPercent) {
    incomeStatus = "Not available";
  } else if (budgetPercent < 100) {
    incomeStatus = "On Track";
  } else if (Math.ceil(budgetPercent) === 100) {
    incomeStatus = "Achieved";
  } else {
    incomeStatus = "Surpassed";
  }

  switch (incomeStatus) {
    case "On Track":
      incomeTooltip = "You're progressing steadily toward your income goal.";
      break;
    case "Achieved":
      incomeTooltip = "Awesome! You've reached your income goal.";
      break;
    case "Surpassed":
      incomeTooltip = "You've gone beyond your income goal, great job!";
      break;
    default:
      incomeTooltip = "Income status data is not available.";
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Income Budget</h3>
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="relative group flex items-center gap-4 cursor-default">
          <span
            style={dynamicIncomeRingBG}
            className="budget-ring-income"
          ></span>
          <span
            className={clsx(
              "text-3xl font-bold text-[rgb(var(--color-text))]",
              budgetPercent > 100 && "text-green-500"
            )}
          >
            {Math.ceil(budgetPercent)}%
          </span>
          <span className="absolute bottom-full bg-gray-700 mb-2 w-max whitespace-nowrap rounded px-3 py-1.5 text-xs text-white hidden group-hover:block z-10">
            {incomeTooltip}
          </span>
        </div>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          {`${Math.ceil(
            budgetPercent
          )}% of ${currencySymbol}${totalIncomeBudget.toFixed(2)} goal reached`}
        </p>
        <p className="text-sm font-medium">
          <strong className="text-[rgb(var(--color-muted))]">
            {budgetPercent > 100 ? "Extra" : "Remaining"}:
          </strong>{" "}
          {`${currencySymbol}${
            remainingIncome < 0
              ? Math.abs(remainingIncome).toFixed(2)
              : remainingIncome.toFixed(2)
          }`}
        </p>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          <b>Status:</b>{" "}
          <span
            className={clsx(
              "text-[rgb(var(--color-brand))]",
              budgetPercent >= 100 && "text-green-500"
            )}
          >
            {incomeStatus}
          </span>
        </p>
      </div>
    </div>
  );
};

export default IncomeBudgetOverview;
