import { useOverviewContext } from "../../context/OverviewContext";
import clsx from "clsx";

const IncomeBudgetOverview = () => {
  const {
    totalIncomeBudget,
    incomeBudgetPercent,
    remainingIncome,
    formattedAmount,
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
      <h3 className="text-2xl font-medium mb-2">Income Budget</h3>
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="relative group flex items-center gap-4 cursor-default w-fit overflow-x-visible">
          <span
            style={dynamicIncomeRingBG}
            className="budget-ring-income"
          ></span>
          <span
            className={clsx(
              "text-4xl font-bold text-[rgb(var(--color-text))]",
              budgetPercent > 100 && "text-green-500"
            )}
          >
            {Math.ceil(budgetPercent)}%
          </span>
          <span className="absolute bottom-full bg-gray-700 mb-2 w-max whitespace-nowrap rounded px-3 py-2 text-sm text-white hidden group-hover:block z-10">
            {incomeTooltip}
          </span>
        </div>
        <p className="text-base text-[rgb(var(--color-muted))]">
          <strong>{Math.ceil(budgetPercent)}%</strong> of{" "}
          <strong>{formattedAmount(totalIncomeBudget)}</strong> goal reached
        </p>
        <p className="text-base font-medium">
          {budgetPercent > 100 ? "Extra" : "Remaining"}:{" "}
          <strong className="text-[rgb(var(--color-muted))]">
            {remainingIncome < 0
              ? Math.abs(formattedAmount(remainingIncome))
              : formattedAmount(remainingIncome)}
          </strong>
        </p>
        <p className="font-medium text-base">
          Status:{" "}
          <strong
            className={clsx(
              "text-[rgb(var(--color-brand))]",
              budgetPercent >= 100 && "text-green-500"
            )}
          >
            {incomeStatus}
          </strong>
        </p>
      </div>
    </div>
  );
};

export default IncomeBudgetOverview;
