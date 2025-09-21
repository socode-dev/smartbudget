import { useContext, createContext, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { formatAmount } from "../utils/formatAmount";
import useCurrencyStore from "../store/useCurrencyStore";
import { categoryColor } from "../data/categoryData";

const ReportChartContext = createContext();

export const ReportChartProvider = ({ children }) => {
  const transactions = useTransactionStore((state) => state.transactions);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);

  const expenses = useMemo(
    () => transactions?.filter((tx) => tx.type === "expense"),
    [transactions]
  );

  const categoryTotals = useMemo(
    () =>
      expenses?.reduce((acc, tx) => {
        const cat = tx.category;
        acc[cat] = (acc[cat] || 0) + tx.amount;
        return acc;
      }, {}),
    [expenses]
  );

  const labels = categoryTotals ? Object.keys(categoryTotals) : [];
  const amounts = categoryTotals ? Object.values(categoryTotals) : [];
  const totalAmount = useMemo(
    () => expenses?.reduce((acc, tx) => acc + tx.amount, 0),
    [expenses]
  );

  const backgroundColor = useMemo(
    () => labels?.map((label) => categoryColor[label] || "#9CA3AF"),
    [labels, categoryColor]
  );

  const formattedLabels = useMemo(
    () =>
      labels?.map((label) => {
        const percentage = totalAmount
          ? ((categoryTotals[label] / totalAmount) * 100)?.toFixed(1)
          : 0;
        return `${label} (${percentage}%)`;
      }),
    [labels, totalAmount, categoryTotals]
  );

  // Data for doughnut chart
  const doughnutChartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: "Expenses by Category",
        data: amounts,
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };

  // Options for doughnut chart

  const doughnutChartOptions = {
    responsive: true,
    cutout: "40%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#6b7280",
          font: {
            size: 12,
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

  // Data for bar chart
  const barChartData = {
    labels,
    datasets: [
      {
        label: "Expenses by Category",
        data: amounts,
        backgroundColor,
        borderWidth: 1,
        borderRadius: 50,
        color: "#6b7280",
        font: { weight: 400, size: 12 },
      },
    ],
  };

  // Options for bar chart
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        padding: 10,
        labels: {
          font: {
            size: 12,
            weight: "400",
          },
          scales: {
            x: {
              ticks: {
                color: "#6b7280",
              },
            },
            y: {
              ticks: {
                color: "#6b7280",
              },
            },
          },
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];
            const total = dataset.data.reduce((acc, val) => acc + val, 0);

            return chart.data.labels.map((label, i) => {
              const value = dataset.data[i];
              const percentage = total ? ((value / total) * 100).toFixed(1) : 0;

              return {
                text: `${label} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: dataset.backgroundColor[i],
                lineWidth: 0.5,
                hidden: false,
                index: i,
                fontColor: "#6b7280",
              };
            });
          },
          padding: 12,
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
    maintainAspectRatio: false,
  };

  return (
    <ReportChartContext.Provider
      value={{
        doughnutChartData,
        doughnutChartOptions,
        barChartData,
        barChartOptions,
      }}
    >
      {children}
    </ReportChartContext.Provider>
  );
};

export const useReportChartContext = () => useContext(ReportChartContext);
