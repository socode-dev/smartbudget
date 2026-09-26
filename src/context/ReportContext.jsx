import { createContext, useCallback, useContext, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import useCurrencyStore from "../store/useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";
import { addPdfHeader, pdfColors } from "../utils/addPdfHeader";
import { downloadCsv } from "../utils/downloadCsv";
import { formatPdfAmount } from "../utils/formatPdfAmount";

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const transactions = useTransactionStore((state) => state.transactions);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);

  const expenses = useMemo(
    () => transactions?.filter((tx) => tx.type === "expense"),
    [transactions],
  );

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (total, transaction) => total + Number(transaction.amount),
        0,
      ),
    [expenses],
  );

  const categoryBreakdown = useMemo(() => {
    const groups = new Map();
    for (const transaction of expenses) {
      const category = transaction.category || "Uncategorized";
      const group = groups.get(category) || { category, amount: 0, count: 0 };
      group.amount += Number(transaction.amount);
      group.count += 1;
      groups.set(category, group);
    }
    return [...groups.values()]
      .sort((a, b) => b.amount - a.amount)
      .map((group) => ({
        ...group,
        percentage:
          totalExpenses > 0 ? (group.amount / totalExpenses) * 100 : 0,
      }));
  }, [expenses, totalExpenses]);

  const reportTableData = useCallback(
    () =>
      categoryBreakdown.map((row, index) => ({
        No: index + 1,
        Category: row.category,
        Amount: formatAmount(row.amount, selectedCurrency),
        Percentage: `${row.percentage.toFixed(1)}%`,
        Count: row.count,
      })),
    [categoryBreakdown, selectedCurrency],
  );

  // Handler for exporting via CSV
  const handleCSVExport = useCallback(() => {
    const data = reportTableData();

    // Convert table data to CSV
    const csvData = Papa.unparse(data);
    downloadCsv(csvData, "vydra-expense-report.csv");
  }, [reportTableData]);

  // Handler for exporting via PDF
  const handlePDFExport = useCallback(async () => {
    const doc = new jsPDF();

    await addPdfHeader(
      doc,
      "Vydra Expenses Report",
      "Expense distribution by category and share of total spending.",
    );

    // Set table columns and and rows value for PDF
    const tableColumn = ["S/N", "Category", "Amount", "% of Total", "Count"];
    const tableRows = categoryBreakdown.map((category, index) => [
      index + 1,
      category.category,
      formatPdfAmount(category.amount, selectedCurrency),
      `${category.percentage.toFixed(1)}%`,
      category.count,
    ]);

    // Define the table structure and style
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: { top: 3.5, right: 4, bottom: 3.5, left: 4 },
        lineColor: pdfColors.border,
        lineWidth: 0.2,
        textColor: pdfColors.text,
      },
      headStyles: {
        fillColor: pdfColors.blue,
        textColor: pdfColors.headerText,
        fontStyle: "bold",
        halign: "center",
        lineColor: pdfColors.blue,
      },
      bodyStyles: {
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: pdfColors.rowAlternate,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "center", cellWidth: 18 },
      },
      foot: [
        [
          "",
          "Total",
          formatPdfAmount(totalExpenses, selectedCurrency),
          "100%",
          expenses.length,
        ],
      ],
      footStyles: {
        fillColor: pdfColors.navy,
        textColor: pdfColors.headerText,
        fontStyle: "bold",
      },
    });

    // Save the PDF
    doc.save("vydra-expense-report.pdf");
  }, [categoryBreakdown, expenses, selectedCurrency, totalExpenses]);

  return (
    <ReportContext.Provider
      value={{
        expenses,
        categoryBreakdown,
        totalExpenses,
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
