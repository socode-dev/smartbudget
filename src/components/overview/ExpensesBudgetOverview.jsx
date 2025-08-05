import { useOverviewContext } from "../../context/OverviewContext";
import clsx from "clsx";

const ExpensesBudgetOverview = () => {
  const {
    totalExpensesBudget,
    expensesBudgetPercent,
    remainingExpenses,
    currencySymbol,
  } = useOverviewContext();

  const budgetPercent = expensesBudgetPercent || 0;

  const dynamicExpenseRingBG = {
    background: `conic-gradient(${
      budgetPercent < 100
        ? "rgb(245, 158, 11)"
        : budgetPercent < 50
        ? "rgb(37, 99, 235)"
        : "rgb(220, 38, 38)"
    } 0% ${Math.ceil(budgetPercent)}%, rgb(229 231 235) ${Math.ceil(
      budgetPercent
    )}% 100%)`,
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
      <h3 className="text-lg font-medium mb-2">Expense Budget</h3>
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="relative group flex items-center gap-4 cursor-default">
          <span
            style={dynamicExpenseRingBG}
            className="budget-ring-expense"
          ></span>
          <span
            className={clsx(
              "text-3xl font-bold text-[rgb(var(--color-text))]",
              budgetPercent > 50 && "text-amber-500",
              budgetPercent > 90 && "text-red-600"
            )}
          >
            {Math.ceil(budgetPercent)}%
          </span>
          <span className="absolute bottom-full bg-gray-700 mb-2 w-full rounded px-3 py-1.5 text-xs text-white hidden group-hover:block z-10">
            {expensesTooltip}
          </span>
        </div>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          {`${Math.ceil(
            budgetPercent
          )}% of ${currencySymbol}${totalExpensesBudget.toFixed(2)} limit used`}
        </p>
        <p className="text-sm font-medium">
          <strong className="text-[rgb(var(--color-muted))]">
            {budgetPercent > 100 ? "Overspent" : "Remaining"}:
          </strong>{" "}
          {currencySymbol}
          {budgetPercent > 100
            ? Math.abs(remainingExpenses).toFixed(2)
            : remainingExpenses.toFixed(2)}
        </p>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          <b>Status:</b>{" "}
          <span
            className={clsx(
              budgetPercent < 50
                ? "text-[rgb(var(--color-brand))]"
                : budgetPercent < 100
                ? "text-amber-500"
                : "text-red-600"
            )}
          >
            {expensesStatus}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ExpensesBudgetOverview;
