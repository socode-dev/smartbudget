import { createContext, useContext, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { eachMonthOfInterval, format } from "date-fns";
import { useOverviewContext } from "./OverviewContext";

const OverviewChartContext = createContext();

export const OverviewChartProvider = ({ children }) => {
  const { transactions, currencySymbol } = useTransactionStore();
  const { totalBudget, totalBudgetUsed } = useOverviewContext();

  const budgetRemaining =
    totalBudget - totalBudgetUsed > 0 ? totalBudget - totalBudgetUsed : 0;

  const dates = transactions.map((tx) => new Date(tx.date));

  const firstDate = new Date(Math.min(...dates));
  const lastDate = new Date(Math.max(...dates));

  const months = eachMonthOfInterval({
    start: new Date(firstDate.getFullYear(), firstDate.getMonth()),
    end: new Date(lastDate.getFullYear(), lastDate.getMonth()),
  }).map((date) => format(date, "MMM"));

  const monthlyIncome = months.map((month) => {
    const sameMonthTransactions = transactions.filter(
      (transaction) =>
        transaction.type === "income" &&
        format(new Date(transaction.date), "MMM") === month
    );
    const totalMonthlyIncome = sameMonthTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    return totalMonthlyIncome;
  });

  const monthlyExpenses = months.map((month) => {
    const sameMonthTransactions = transactions.filter(
      (transaction) =>
        transaction.type === "expense" &&
        format(new Date(transaction.date), "MMM") === month
    );
    const totalMonthlyExpenses = sameMonthTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    return totalMonthlyExpenses;
  });

  // Combine all values into one array to get max
  const allValues = [...monthlyIncome, ...monthlyExpenses];
  const maxValue = Math.max(...allValues);

  // Only set stepSize if max is greater than 60000
  let stepSize;
  switch (true) {
    case maxValue > 200000:
      stepSize = 30000;
      break;
    case maxValue > 140000:
      stepSize = 25000;
      break;
    case maxValue > 70000:
      stepSize = 20000;
      break;
    case maxValue > 30000:
      stepSize = 10000;
      break;
    case maxValue > 10000:
      stepSize = 5000;
      break;
    default:
      stepSize = 2000;
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
          color: "#475569",
          font: { size: 13, weight: 400 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || "";

            return `${label} ${currencySymbol}${value?.toFixed(2)}`;
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
          callback: (value) => `${currencySymbol}${value.toLocaleString()}`,
          color: "#64748B",
          font: { size: 12 },
        },
        grid: {
          color: "#E2E8F0",
        },
      },
      x: {
        ticks: {
          color: "#64748B",
          font: { size: 12 },
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
        backgroundColor: ["#F97316", "#E5E7EB"],
        hoverBackgroundColor: ["#EA580C", "#D1D5DB"],
        borderWidth: 2,
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
          color: "#6B7280",
          font: {
            size: 13,
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
            return `${label} ${currencySymbol}${amount?.toFixed(2)}`;
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
