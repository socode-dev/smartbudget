import { createContext, useContext, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { eachMonthOfInterval, format } from "date-fns";
import { useOverviewContext } from "./OverviewContext";
import { formatAmount } from "../utils/formatAmount";
import useCurrencyStore from "../store/useCurrencyStore";

const OverviewChartContext = createContext();

export const OverviewChartProvider = ({ children }) => {
  const transactions = useTransactionStore((state) => state.transactions);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const { totalBudget, totalBudgetUsed } = useOverviewContext();

  const budgetRemaining =
    totalBudget - totalBudgetUsed > 0 ? totalBudget - totalBudgetUsed : 0;

  const dates = transactions?.map((tx) => new Date(tx.date));

  const firstDate =
    dates?.length > 0 ? new Date(Math.min(...dates)) : new Date();
  const lastDate =
    dates?.length > 0 ? new Date(Math.max(...dates)) : new Date();

  const months = eachMonthOfInterval({
    start: new Date(firstDate.getFullYear(), firstDate.getMonth()),
    end: new Date(lastDate.getFullYear(), lastDate.getMonth()),
  }).map((date) => format(date, "MMM"));

  const monthlyIncome = useMemo(
    () =>
      months.map((month) => {
        const sameMonthTransactions = transactions?.filter(
          (transaction) =>
            transaction.type === "income" &&
            format(new Date(transaction.date), "MMM") === month
        );
        const totalMonthlyIncome = sameMonthTransactions?.reduce(
          (sum, tx) => sum + tx.amount,
          0
        );
        return totalMonthlyIncome;
      }),
    [transactions]
  );

  const monthlyExpenses = useMemo(
    () =>
      months.map((month) => {
        const sameMonthTransactions = transactions?.filter(
          (transaction) =>
            transaction.type === "expense" &&
            format(new Date(transaction.date), "MMM") === month
        );
        const totalMonthlyExpenses = sameMonthTransactions?.reduce(
          (sum, tx) => sum + tx.amount,
          0
        );
        return totalMonthlyExpenses;
      }),
    [transactions]
  );

  // Combine all values into one array to get max
  const allValues = [...monthlyIncome, ...monthlyExpenses];
  const maxValue = Math.max(...allValues);

  // Only set stepSize if max is greater than 60000
  let stepSize;
  switch (true) {
    case maxValue > 150000:
      stepSize = 25000;
      break;
    case maxValue > 100000:
      stepSize = 20000;
      break;
    case maxValue > 50000:
      stepSize = 10000;
      break;
    case maxValue > 20000:
      stepSize = 5000;
      break;
    case maxValue > 10000:
      stepSize = 2000;
      break;
    case maxValue > 5000:
      stepSize = 1000;
    default:
      stepSize = 500;
  }

  // Income vs Expenses line chart data
  const incomeVsExpensesData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: monthlyIncome,
        borderColor: "#10B981",
        tension: 0.3,
      },
      {
        label: "Expenses",
        data: monthlyExpenses,
        borderColor: "#EF4444",
        tension: 0.3,
      },
    ],
  };

  // Income vs Expenses line chart options
  const incomeVsExpensesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 12, bottom: 12 },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9ca3af",
          font: { size: 14, weight: 400 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || "";

            return `${label} ${formatAmount(value, selectedCurrency)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: maxValue,
        ticks: {
          stepSize,
          callback: (value) => formatAmount(value, selectedCurrency),
          color: "#9ca3af",
          font: { size: 14 },
        },
        grid: {
          color: "#9ca3af",
        },
      },
      x: {
        ticks: {
          color: "#9ca3af",
          font: { size: 14 },
        },
      },
    },
  };

  // Budget overview doughnut chart data
  const budgetOverviewData = {
    labels: ["Used", "Remaining"],
    datasets: [
      {
        data: [totalBudgetUsed, budgetRemaining],
        backgroundColor: ["#f59e0b", "#9ca3af"],
        hoverBackgroundColor: ["#d97706", "#6b7280"],
        borderWidth: 1,
      },
    ],
  };

  // Budget overview doughnut chart options

  const budgetOverviewOptions = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#9ca3af",
          font: {
            size: 14,
            weight: "400",
          },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const amount = context.raw || "";
            return `${label} ${formatAmount(amount, selectedCurrency)}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <OverviewChartContext.Provider
      value={{
        monthlyIncome,
        monthlyExpenses,
        incomeVsExpensesData,
        incomeVsExpensesOptions,
        budgetOverviewData,
        budgetOverviewOptions,
      }}
    >
      {children}
    </OverviewChartContext.Provider>
  );
};

export const useOverviewChartContext = () => useContext(OverviewChartContext);
