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
    currencySymbol,
    incomeLabel,
    expensesLabel,
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
      return <p className="text-xs text-green-500">You are in the green</p>;
    } else if (totalIncome === 0) {
      return (
        <p className="text-xs text-[rgb(var(--color-brand))]">
          No income recorded
        </p>
      );
    } else if (totalIncome > 0 && totalExpenses === 0) {
      return <p className="text-xs text-indigo-500">No spending yet</p>;
    } else {
      return <p className="text-xs text-red-500">You are in the red</p>;
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
          <h3 className="text-sm text-[rgb(var(--color-muted))]">
            Total Income
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {currencySymbol}
            {totalIncome?.toFixed(2)}
          </p>
          <p className="text-xs text-green-500">{incomeLabel}</p>
        </div>
      </div>

      {/* Total Expenses */}
      <div className={cardContainerStyle}>
        <div className={cardIconStyle}>
          <FaCreditCard size={24} className="text-red-400" />
        </div>

        <div className={cardContentStyle}>
          <h3 className="text-sm text-[rgb(var(--color-muted))]">
            Total Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {currencySymbol}
            {totalExpenses?.toFixed(2)}
          </p>
          <p className="text-xs text-red-500">{expensesLabel}</p>
        </div>
      </div>

      {/* Net Balance */}
      <div className={cardContainerStyle}>
        <div className={cardIconStyle}>
          <FaChartLine size={24} className="text-blue-400" />
        </div>

        <div className={cardContentStyle}>
          <h3 className="text-sm text-[rgb(var(--color-muted))]">
            Net Balance
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {currencySymbol}
            {netBalance?.toFixed(2)}
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
          <h3 className="text-sm text-[rgb(var(--color-muted))]">
            Budget Usage
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {budgetUsagePercentage > 0 ? budgetUsagePercentage : "0"}% used
          </p>
          <p className="text-xs text-[rgb(var(--color-muted))]">
            {`${currencySymbol}${totalBudgetUsed.toFixed(
              2
            )} of ${currencySymbol}${totalBudget.toFixed(2)}`}
          </p>
        </div>
      </div>
    </>
  );
};

export default SummaryCards;
