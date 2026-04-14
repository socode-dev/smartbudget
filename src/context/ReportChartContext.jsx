import { useContext, createContext, useMemo, useRef } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { formatAmount } from "../utils/formatAmount";
import useCurrencyStore from "../store/useCurrencyStore";
import { getRandomColor } from "../utils/randomColor";

const ReportChartContext = createContext();

export const ReportChartProvider = ({ children }) => {
  const transactions = useTransactionStore((state) => state.transactions);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);

  const expenses = useMemo(
    () => transactions?.filter((tx) => tx.type === "expense"),
    [transactions],
  );

  const categoryTotals = useMemo(
    () =>
      expenses?.reduce((acc, tx) => {
        const cat = tx.category;
        acc[cat] = (acc[cat] || 0) + tx.amount;
        return acc;
      }, {}),
    [expenses],
  );

  const labels = categoryTotals ? Object.keys(categoryTotals) : [];
  const amounts = categoryTotals ? Object.values(categoryTotals) : [];
  const colorsRef = useRef({});
  const totalAmount = useMemo(
    () => expenses?.reduce((acc, tx) => acc + tx.amount, 0),
    [expenses],
  );
  const maxAmount = useMemo(() => Math.max(0, ...amounts), [amounts]);

  // Scale chart steps with the largest expense. Example: 10,000 -> 2,000 step, 20,000 -> 5,000 step.
  const yAxisStepSize = useMemo(() => {
    if (!maxAmount) return 1000;

    const roughStep = maxAmount / 5;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalized = roughStep / magnitude;

    if (normalized <= 1) return magnitude;
    if (normalized <= 2) return 2 * magnitude;
    if (normalized <= 5) return 5 * magnitude;
    return 10 * magnitude;
  }, [maxAmount]);

  const yAxisMax = useMemo(() => {
    if (!maxAmount) return yAxisStepSize * 5;
    return Math.ceil(maxAmount / yAxisStepSize) * yAxisStepSize;
  }, [maxAmount, yAxisStepSize]);

  const randomColors = useMemo(
    () =>
      labels.map((label) => {
        if (!colorsRef.current[label]) {
          colorsRef.current[label] = getRandomColor();
        }
        return colorsRef.current[label];
      }),
    [labels],
  );

  const formattedLabels = useMemo(
    () =>
      labels?.map((label) => {
        const percentage = totalAmount
          ? ((categoryTotals[label] / totalAmount) * 100)?.toFixed(1)
          : 0;
        return `${label} (${percentage}%)`;
      }),
    [labels, totalAmount, categoryTotals],
  );

  // Data for doughnut chart
  const doughnutChartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: "Expenses by Category",
        data: amounts,
        backgroundColor: randomColors,
        borderColor: randomColors,
        borderWidth: 1,
      },
    ],
  };

  // Options for doughnut chart

  const doughnutChartOptions = {
    responsive: true,
    cutout: "30%",
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
        backgroundColor: randomColors,
        borderColor: randomColors,
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
    scales: {
      x: {
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        beginAtZero: true,
        max: yAxisMax,
        ticks: {
          stepSize: yAxisStepSize,
          color: "#6b7280",
          callback: (value) => formatAmount(Number(value), selectedCurrency),
        },
      },
    },
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
