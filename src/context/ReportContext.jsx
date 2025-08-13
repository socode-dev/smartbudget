import { createContext, useCallback, useContext, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatAmount } from "../utils/formatAmount";
import useCurrencyStore from "../store/useCurrencyStore";

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useCurrencyStore();

  // Helper to format amount to currency amount
  const formattedAmount = useCallback(
    (amount) => {
      const formatCurrency = formatAmount(selectedCurrency);
      const amountFormat = formatCurrency.format(amount);

      return amountFormat;
    },
    [selectedCurrency]
  );

  const expenses = useMemo(
    () => transactions.filter((tx) => tx.type === "expense"),
    [transactions]
  );

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
    const totalAmount = expenses.reduce((acc, tx) => acc + tx.amount, 0);
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
        amount: formattedAmount(totalCategoryAmount),
        percentage: `${parseFloat(percentage)}%`,
        count: reportItems.length,
      };
    });

    // Sort by amount descending
    return tableData.sort((a, b) => b.amount - a.amount);
  }, [expenses]);

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

    // Add PDF heading and style
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
        expenses,
        reportTableData,
        handleCSVExport,
        handlePDFExport,
        formattedAmount,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReportContext = () => useContext(ReportContext);
