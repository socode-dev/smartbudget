import { useOverviewContext } from "../../context/OverviewContext";
import BudgetSummary from "./BudgetSummary";

const IncomeBudgetOverview = () => {
  const { totalIncomeBudget, incomeBudgetPercent, remainingIncome } =
    useOverviewContext();
  const hasBudget = totalIncomeBudget > 0;
  const percentage = Number.isFinite(incomeBudgetPercent) ? incomeBudgetPercent : 0;
  
  const status = !hasBudget
    ? "Not available"
    : percentage > 100
      ? "Surpassed"
      : percentage === 100
        ? "Achieved"
        : "On Track";

  return (
    <BudgetSummary
      title="Income Budget"
      total={totalIncomeBudget}
      percentage={percentage}
      remaining={remainingIncome}
      hasBudget={hasBudget}
      status={status}
      tone={hasBudget && percentage >= 100 ? "success" : "primary"}
      type="income"
    />
  );
};

export default IncomeBudgetOverview;
