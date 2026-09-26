import { useOverviewContext } from "../../context/OverviewContext";
import BudgetSummary from "./BudgetSummary";

const ExpensesBudgetOverview = () => {
  const { totalExpensesBudget, expensesBudgetPercent, remainingExpenses } =
    useOverviewContext();
  const hasBudget = totalExpensesBudget > 0;
  const percentage = Number.isFinite(expensesBudgetPercent)
    ? expensesBudgetPercent
    : 0;
  const status = !hasBudget
    ? "Not available"
    : percentage > 100
      ? "Overspent - Limit exceeded"
      : percentage === 100
        ? "Limit reached"
        : percentage >= 50
          ? "Warning - Nearing limit"
          : "On Track - Usage is low";
  const tone =
    percentage > 100 ? "danger" : percentage >= 50 ? "warning" : "primary";
  return (
    <BudgetSummary
      title="Expense Budget"
      total={totalExpensesBudget}
      percentage={percentage}
      remaining={remainingExpenses}
      hasBudget={hasBudget}
      status={status}
      tone={tone}
      type="expense"
    />
  );
};

export default ExpensesBudgetOverview;
