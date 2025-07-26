import { categoryColor } from "./barChart";

export const getDoughnutChartData = (transactions) => {
  const expenses = transactions.filter((tx) => tx.type === "expense");

  const categoryTotals = expenses.reduce((acc, tx) => {
    const cat = tx.category;
    acc[cat] = (acc[cat] || 0) + tx.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);
  const totalAmount = expenses.reduce((acc, tx) => acc + tx.amount, 0);

  const formattedLabels = labels.map((label, i) => {
    const percentage = totalAmount
      ? ((categoryTotals[label] / totalAmount) * 100)?.toFixed(1)
      : 0;
    return `${label} (${percentage}%)`;
  });

  const backgroundColor = labels.map(
    (label) => categoryColor[label] || "#9CA3AF"
  );

  return {
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
};

export const doughnutChartOptions = (currencySymbol) => {
  return {
    responsive: true,
    cutout: "40%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#334155",
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
  };
};
