export const categoryColor = {
  Freelance: "#38BDF8",
  Salary: "#10B981",
  Investments: "#6366F1",
  Gifts: "#D946EF",
  Loan: "#EF4444",
  Groceries: "#84CC16",
  Transport: "#F59E0B",
  Dining: "#F43F5E",
  Shopping: "#A855F7",
  Utilities: "#14B8A6",
  Health: "#06B6D4",
  Entertainment: "#FB923C",
  Other: "#9CA3AF",
};

export const getBarChartData = (transactions) => {
  const expenses = transactions.filter((tx) => tx.type === "expense");

  const categoryTotals = expenses.reduce((acc, tx) => {
    const cat = tx.category;
    acc[cat] = (acc[cat] || 0) + tx.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);
  const totalAmount = expenses.reduce((acc, tx) => acc + tx.amount, 0);

  const backgroundColor = labels.map(
    (label) => categoryColor[label] || "#9CA3AF"
  );

  return {
    labels,
    datasets: [
      {
        label: "Expenses by Category",
        data: amounts,
        backgroundColor,
        borderWidth: 1,
        borderRadius: 50,
      },
    ],
  };
};

export const barChartOptions = (currencySymbol) => {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        padding: 10,
        labels: {
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
              };
            });
          },
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
            const value = context.raw || "";

            return `${label} ${currencySymbol}${value?.toFixed(2)}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };
};
