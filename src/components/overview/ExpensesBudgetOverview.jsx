import { useOverviewContext } from "../../context/OverviewContext";
import clsx from "clsx";
import useCurrencyStore from "../../store/useCurrencyStore";
import { formatAmount } from "../../utils/formatAmount";

const ExpensesBudgetOverview = () => {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const overviewContext = useOverviewContext();
  const totalExpensesBudget = overviewContext.totalExpensesBudget;
  const expensesBudgetPercent = overviewContext.expensesBudgetPercent;
  const remainingExpenses = overviewContext.remainingExpenses;

  const budgetPercent = expensesBudgetPercent || 0;

  let dynamicColor = "rgb(29, 78, 216)";

  if (budgetPercent > 90) {
    dynamicColor = "rgb(220, 38, 38)";
  } else if (budgetPercent > 50) {
    dynamicColor = "rgb(245, 158, 11)";
  }

  const dynamicExpenseRingBG = {
    background: `conic-gradient(${dynamicColor} 0% ${Math.ceil(
      budgetPercent
    )}%, rgb(107, 114, 158) ${Math.ceil(budgetPercent)}% 100%)`,
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
      <h3 className="text-xl md:text-2xl font-semibold mb-2">Expense Budget</h3>
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
          <strong>{formatAmount(totalExpensesBudget, selectedCurrency)}</strong>{" "}
          limit used
        </p>
        <p className="text-base text-[rgb(var(--color-muted))]">
          {budgetPercent > 100 ? "Overspent" : "Remaining"}:{" "}
          <strong
            className={clsx(
              "text-[rgb(var(--color-muted))]",
              budgetPercent > 100 && "text-red-600"
            )}
          >
            {budgetPercent > 100
              ? `-${formatAmount(
                  Math.abs(remainingExpenses),
                  selectedCurrency
                )}`
              : formatAmount(remainingExpenses, selectedCurrency)}
          </strong>
        </p>
        <p className="text-base text-[rgb(var(--color-muted))]">
          Status:{" "}
          <span
            className={clsx(
              "px-2 py-1 rounded font-medium",
              budgetPercent < 50
                ? "text-[rgb(var(--color-brand))] bg-[rgb(var(--color-status-bg-blue))]"
                : budgetPercent < 100
                ? "text-amber-500 bg-[rgb(var(--color-status-bg-amber))]"
                : "text-red-600 bg-[rgb(var(--color-status-bg-red))]"
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
