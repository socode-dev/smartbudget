import { useOverviewContext } from "../../context/OverviewContext";
import clsx from "clsx";

const ExpensesBudgetOverview = () => {
  const {
    totalExpensesBudget,
    expensesBudgetPercent,
    remainingExpenses,
    formattedAmount,
  } = useOverviewContext();

  const budgetPercent = expensesBudgetPercent || 0;

  let dynamicColor = "rgb(37, 99, 235)";

  if (budgetPercent > 50) {
    dynamicColor = "rgb(245, 158, 11)";
  } else if (budgetPercent > 90) {
    dynamicColor = "rgb(220, 38, 38)";
  }

  const dynamicExpenseRingBG = {
    background: `conic-gradient(${dynamicColor} 0% ${Math.ceil(
      budgetPercent
    )}%, rgb(229 231 235) ${Math.ceil(budgetPercent)}% 100%)`,
  };

  let expensesStatus = "";
  let expensesTooltip = "";

  if (!budgetPercent) {
    expensesStatus = "Not available";
  } else if (budgetPercent < 50) {
    expensesStatus = "On Track - Usage is low";
  } else if (budgetPercent < 100) {
    expensesStatus = "Warning - Nearing limit";
  } else {
    expensesStatus = "Overspent - Limit exceeded";
  }

  switch (expensesStatus) {
    case "On Track - Usage is low":
      expensesTooltip = "You're managing your expenses well this month.";
      break;
    case "Warning - Nearing limit":
      expensesTooltip = "You're getting close to your budget limit.";
      break;
    case "Overspent - Limit exceeded":
      expensesTooltip =
        "You've gone over your budget. Time to reassess your spending.";
      break;
    default:
      expensesTooltip = "Expenses usage data not available.";
  }

  return (
    <div>
      <h3 className="text-2xl font-medium mb-2">Expense Budget</h3>
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="relative w-fit group flex items-center gap-4 cursor-default overflow-x-visible">
          <span
            style={dynamicExpenseRingBG}
            className="budget-ring-expense"
          ></span>
          <span
            className={clsx(
              "text-4xl font-bold text-[rgb(var(--color-text))]",
              budgetPercent > 50 && "text-amber-500",
              budgetPercent > 90 && "text-red-600"
            )}
          >
            {Math.ceil(budgetPercent)}%
          </span>
          <span className="absolute bottom-full bg-gray-700 mb-2 w-max rounded px-3 py-2 text-sm text-white hidden group-hover:block z-10">
            {expensesTooltip}
          </span>
        </div>
        <p className="text-base text-[rgb(var(--color-muted))]">
          <strong>{Math.ceil(budgetPercent)}%</strong> of{" "}
          <strong>{formattedAmount(totalExpensesBudget)}</strong> limit used
        </p>
        <p className="text-base font-medium">
          {budgetPercent > 100 ? "Overspent" : "Remaining"}:{" "}
          <strong className="text-[rgb(var(--color-muted))]">
            {budgetPercent > 100
              ? Math.abs(formattedAmount(remainingExpenses))
              : formattedAmount(remainingExpenses)}
          </strong>
        </p>
        <p className="text-base font-medium">
          Status:{" "}
          <strong
            className={clsx(
              budgetPercent < 50
                ? "text-[rgb(var(--color-brand))]"
                : budgetPercent < 100
                ? "text-amber-500"
                : "text-red-600"
            )}
          >
            {expensesStatus}
          </strong>
        </p>
      </div>
    </div>
  );
};

export default ExpensesBudgetOverview;
