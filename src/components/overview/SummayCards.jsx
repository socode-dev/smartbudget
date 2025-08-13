import {
  FaMoneyBillWave,
  FaCreditCard,
  FaChartLine,
  FaChartPie,
} from "react-icons/fa";
import { useOverviewContext } from "../../context/OverviewContext";
import { useCallback, useMemo } from "react";

const SummaryCards = () => {
  const {
    totalIncome,
    totalExpenses,
    netBalance,
    totalBudget,
    budgetUsagePercentage,
    totalBudgetUsed,
    incomeLabel,
    expensesLabel,
    formattedAmount,
  } = useOverviewContext();

  // Display net budget label
  const getNetBalanceLabel = useCallback(() => {
    if (netBalance === 0) {
      return (
        <p className="text-xs text-[rgb(var(--color-muted))]">
          You are breaking even
        </p>
      );
    } else if (netBalance > 0) {
      return <p className="text-sm text-green-500">You are in the green</p>;
    } else if (totalIncome === 0) {
      return (
        <p className="text-sm text-[rgb(var(--color-brand))]">
          No income recorded
        </p>
      );
    } else if (totalIncome > 0 && totalExpenses === 0) {
      return <p className="text-sm text-indigo-500">No spending yet</p>;
    } else {
      return <p className="text-sm text-red-500">You are in the red</p>;
    }
  }, [netBalance, totalIncome, totalExpenses]);

  const netBalanceLabel = useMemo(
    () => getNetBalanceLabel(),
    [getNetBalanceLabel]
  );

  const cardContainerStyle =
    "sm:relative flex sm:flex-col justify-evenly items-center text-center gap-4 p-4 rounded-lg bg-[rgb(var(--color-bg-card))] shadow z-0";

  const cardIconStyle =
    "sm:absolute sm:-top-5 sm:left-1/2 sm:-translate-x-1/2 bg-[rgb(var(--color-bg-card))] p-2 rounded-full sm:shadow z-10";

  const cardContentStyle =
    "flex flex-col items-center text-center gap-2 sm:gap-3 lg:gap-4 sm:mt-5";

  return (
    <>
      {/* Total Income */}
      <div className={cardContainerStyle}>
        <div className={cardIconStyle}>
          <FaMoneyBillWave size={24} className="text-green-400" />
        </div>

        <div className={cardContentStyle}>
          <h3 className="text-lg text-[rgb(var(--color-muted))] font-medium">
            Total Income
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {formattedAmount(totalIncome)}
          </p>
          <p className="text-sm text-green-500">{incomeLabel}</p>
        </div>
      </div>

      {/* Total Expenses */}
      <div className={cardContainerStyle}>
        <div className={cardIconStyle}>
          <FaCreditCard size={24} className="text-red-400" />
        </div>

        <div className={cardContentStyle}>
          <h3 className="text-lg text-[rgb(var(--color-muted))] font-medium">
            Total Expenses
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {formattedAmount(totalExpenses)}
          </p>
          <p className="text-sm text-red-500">{expensesLabel}</p>
        </div>
      </div>

      {/* Net Balance */}
      <div className={cardContainerStyle}>
        <div className={cardIconStyle}>
          <FaChartLine size={24} className="text-blue-400" />
        </div>

        <div className={cardContentStyle}>
          <h3 className="text-lg text-[rgb(var(--color-muted))] font-medium">
            Net Balance
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {formattedAmount(netBalance)}
          </p>
          {netBalanceLabel}
        </div>
      </div>

      {/* Budget Usage */}
      <div className={cardContainerStyle}>
        <div className={cardIconStyle}>
          <FaChartPie size={24} className="text-yellow-400" />
        </div>

        <div className={cardContentStyle}>
          <h3 className="text-lg text-[rgb(var(--color-muted))] font-medium">
            Budget Usage
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {budgetUsagePercentage > 0 ? budgetUsagePercentage : "0"}% used
          </p>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            {formattedAmount(totalBudgetUsed)} of {formattedAmount(totalBudget)}
          </p>
        </div>
      </div>
    </>
  );
};

export default SummaryCards;
