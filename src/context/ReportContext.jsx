import { createContext, useCallback, useContext, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const ReportContext = createContext();

const categoryColor = {
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

export const ReportProvider = ({ children }) => {
  const { transactions, currencySymbol } = useTransactionStore();

  const expenses = useMemo(
    () => transactions.filter((tx) => tx.type === "expense"),
    [transactions]
  );

  const categoryTotals = expenses.reduce((acc, tx) => {
    const cat = tx.category;
    acc[cat] = (acc[cat] || 0) + tx.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);
  const totalAmount = expenses.reduce((acc, tx) => acc + tx.amount, 0);

  const reportTableData = useCallback(() => {
    // Group transactions by category e.g, {other: [{...transaction details}]}
    const categoryGroups = expenses.reduce((acc, tx) => {
      if (!acc[tx.category]) {
        acc[tx.category] = [];
      }
      acc[tx.category].push(tx);
      return acc;
    }, {});

    // Convert object to array format [category, transactions]
    const transactionEntries = Object.entries(categoryGroups);
    // Create array of objects with aggregated data
    const tableData = transactionEntries.map(([category, reportItems]) => {
      const totalCategoryAmount = reportItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const percentage = totalAmount
        ? ((totalCategoryAmount / totalAmount) * 100).toFixed(1)
        : 0;

      return {
        category,
        amount: `${currencySymbol}${totalCategoryAmount.toFixed(2)}`,
        percentage: `${parseFloat(percentage)}%`,
        count: reportItems.length,
      };
    });

    // Sort by amount descending
    return tableData.sort((a, b) => b.amount - a.amount);
  }, [expenses, totalAmount]);

  const backgroundColor = labels.map(
    (label) => categoryColor[label] || "#9CA3AF"
  );

  const formattedLabels = labels.map((label) => {
    const percentage = totalAmount
      ? ((categoryTotals[label] / totalAmount) * 100)?.toFixed(1)
      : 0;
    return `${label} (${percentage}%)`;
  });

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
                color: "#6B7280",
              };
            });
          },
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
            const value = context.raw || "";

            return `${label} ${currencySymbol}${value?.toFixed(2)}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Handler for exporting via CSV
  const handleCSVExport = useCallback(() => {
    const data = reportTableData();
    // Convert table data to CSV
    const csvData = Papa.unparse(data);
    // Create a Blob and trigger download
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const temporaryLink = document.createElement("a");
    temporaryLink.setAttribute("href", url);
    temporaryLink.setAttribute("download", "smartbudget-expense-report.csv");
    temporaryLink.style.visibility = "hidden";
    document.body.appendChild(temporaryLink);
    temporaryLink.click();
    document.body.removeChild(temporaryLink);
  }, [reportTableData]);

  // Handler for exporting via PDF
  const handlePDFExport = useCallback(() => {
    const expensesByCategory = reportTableData();

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(23);
    doc.text("SmartBudget Expenses Report by Category", 25, 15);

    // Set table columns and and rows value for PDF
    const tableColumn = ["Category", "Amount", "% of Total", "Count"];
    const tableRows = expensesByCategory.map((category) => {
      return Object.values(category);
    });

    // Define the table structure and style
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        halign: "left",
      },
    });

    // Save the PDF
    doc.save("smartbudget-expense-report.pdf");
  }, [reportTableData]);

  return (
    <ReportContext.Provider
      value={{
        barChartData,
        barChartOptions,
        doughnutChartData,
        doughnutChartOptions,
        reportTableData,
        handleCSVExport,
        handlePDFExport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReportContext = () => useContext(ReportContext);
