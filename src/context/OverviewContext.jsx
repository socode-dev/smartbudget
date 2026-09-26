import { createContext, useContext, useCallback, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { transactionTotal } from "../utils/transactionTotal";
import { getTotalBudgetSpent } from "../utils/getTotalBudgetSpent";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { format } from "date-fns";
import { formatAmount } from "../utils/formatAmount";
import useCurrencyStore from "../store/useCurrencyStore";
import { addPdfHeader, pdfColors } from "../utils/addPdfHeader";
import { downloadCsv } from "../utils/downloadCsv";
import { formatPdfAmount } from "../utils/formatPdfAmount";

const OverviewContext = createContext();

export const OverviewProvider = ({ children }) => {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useTransactionStore((state) => state.budgets);

  // Get last month and this month total income and expenses
  const income = useMemo(
    () => transactions?.filter((tx) => tx.type === "income"),
    [transactions],
  );
  const expenses = useMemo(
    () => transactions?.filter((tx) => tx.type === "expense"),
    [transactions],
  );

  // Get income using month argument
  const getTxTypeByMonth = useCallback((transaction, month) => {
    const now = new Date();
    const target = new Date(
      now.getFullYear(),
      now.getMonth() - (month === "last" ? 1 : 0),
      1,
    );
    return transaction?.filter((tx) => {
      const txMonth = new Date(tx.date).getMonth();
      const txYear = new Date(tx.date).getFullYear();
      return txMonth === target.getMonth() && txYear === target.getFullYear();
    });
  }, []);

  const lastMonthIncome = useMemo(
    () =>
      getTxTypeByMonth(income, "last")?.reduce(
        (total, tx) => total + tx.amount,
        0,
      ),
    [income, getTxTypeByMonth],
  );
  const thisMonthIncome = useMemo(
    () =>
      getTxTypeByMonth(income, "this")?.reduce(
        (total, tx) => total + tx.amount,
        0,
      ),
    [income, getTxTypeByMonth],
  );

  const incomePercentage = useMemo(
    () => ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100,
    [thisMonthIncome, lastMonthIncome],
  );

  let incomeLabel = "";

  if (lastMonthIncome === 0 && thisMonthIncome > 0) {
    incomeLabel = "New income this month";
  } else if (lastMonthIncome === 0 && thisMonthIncome === 0) {
    incomeLabel = "No income recorded";
  } else {
    incomeLabel =
      incomePercentage > 200
        ? "High increase"
        : `${incomePercentage > 0 ? "+" : ""}${incomePercentage.toFixed(
            1,
          )}% from last month`;
  }

  const lastMonthExpense = useMemo(
    () =>
      getTxTypeByMonth(expenses, "last")?.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
    [expenses, getTxTypeByMonth],
  );
  const thisMonthExpense = useMemo(
    () =>
      getTxTypeByMonth(expenses, "this")?.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
    [expenses, getTxTypeByMonth],
  );

  const expensesPercentage = useMemo(
    () => ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100,
    [thisMonthExpense, lastMonthExpense],
  );

  //   Display label under expenses total
  let expensesLabel;

  if (lastMonthExpense === 0 && thisMonthExpense > 0) {
    expensesLabel = "New spending activity";
  } else if (lastMonthExpense === 0 && thisMonthExpense === 0) {
    expensesLabel = "No changes";
  } else {
    let capped;
    if (expensesPercentage > 200) {
      capped = "High increase";
    } else {
      capped = `${
        expensesPercentage > 0 ? "+" : ""
      }${expensesPercentage.toFixed(1)}% from last month`;
    }
    expensesLabel = capped;
  }

  // Get transaction total income, expenses
  const { totalIncome, totalExpenses } = useMemo(
    () => transactionTotal(transactions),
    [transactions],
  );

  const netBalance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );

  // Get total budget limit
  const totalBudget = useMemo(
    () => budgets?.reduce((total, budget) => total + budget.amount, 0),
    [budgets],
  );

  // get total budget used
  const totalBudgetUsed = useMemo(
    () => getTotalBudgetSpent(transactions, budgets, "all"),
    [transactions, budgets],
  );

  const budgetUsagePercentage =
    totalBudget > 0 ? Math.ceil((totalBudgetUsed / totalBudget) * 100) : 0;

  const incomeBudget = useMemo(
    () => budgets?.filter((tx) => tx.type === "income"),
    [budgets],
  );
  const expensesBudget = useMemo(
    () => budgets?.filter((tx) => tx.type === "expense"),
    [budgets],
  );

  const totalIncomeBudget = incomeBudget?.reduce(
    (sum, income) => sum + income.amount,
    0,
  );

  const totalExpensesBudget = expensesBudget?.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const incomeBudgetAchieved = useMemo(
    () => getTotalBudgetSpent(transactions, budgets, "income"),
    [transactions, budgets],
  );
  const expensesBudgetSpent = useMemo(
    () => getTotalBudgetSpent(transactions, budgets, "expense"),
    [transactions, budgets],
  );

  // Calculate total income budget percentage and the remaining/extra budget balance
  const incomeBudgetPercent =
    totalIncomeBudget > 0
      ? (incomeBudgetAchieved / totalIncomeBudget) * 100
      : 0;
  const remainingIncome = totalIncomeBudget - incomeBudgetAchieved;

  // Calculate total expenses budget percentage and the remaining/extra budget balance
  const expensesBudgetPercent =
    totalExpensesBudget > 0
      ? (expensesBudgetSpent / totalExpensesBudget) * 100
      : 0;
  const remainingExpenses = totalExpensesBudget - expensesBudgetSpent;

  // Sort transaction by date for exporting
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions],
  );

  // Return needed key-value pairs needed for pdf and csv format
  const modifiedTransactions = useMemo(
    () =>
      sortedTransactions?.map((transaction) => {
        return {
          Date: format(new Date(transaction.date), "MMM yyyy"),
          Name: transaction.name,
          Type: transaction.type,
          Note: transaction.description || "-",
          Amount: `${transaction.type === "income" ? "+" : "-"}${formatAmount(
            transaction.amount,
            selectedCurrency,
          )}`,
        };
      }),
    [sortedTransactions, selectedCurrency],
  );

  // Handler for exporting via CSV
  const handleCSVExport = useCallback(() => {
    // Convert sorted transaction to CSV
    const csvData = Papa.unparse(modifiedTransactions);
    downloadCsv(csvData, "transactions-overview.csv");
  }, [modifiedTransactions]);

  // Handler for exporting via PDF
  const handlePDFExport = useCallback(async () => {
    if (!modifiedTransactions.length) return;
    const doc = new jsPDF();

    await addPdfHeader(
      doc,
      "Vydra Transaction Activity",
      "A chronological view of your recorded financial activity.",
    );

    // Set table columns and and rows value for PDF
    const tableColumn = Object.keys(modifiedTransactions.at(0));
    const tableRows = sortedTransactions.map((transaction) => [
      format(new Date(transaction.date), "MMM yyyy"),
      transaction.name,
      transaction.type,
      transaction.description || "-",
      `${transaction.type === "income" ? "+" : "-"}${
        formatPdfAmount(transaction.amount, selectedCurrency)
      }`,
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
      showHead: "firstPage",
      headStyles: {
        fillColor: pdfColors.blue,
        textColor: pdfColors.headerText,
        fontStyle: "bold",
        halign: "center",
        lineColor: pdfColors.blue,
      },
      bodyStyles: {
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: pdfColors.rowAlternate,
      },
      columnStyles: {
        0: { cellWidth: 24 },
        2: { cellWidth: 22 },
        4: { halign: "right" },
      },
    });

    // Save the PDF
    doc.save("transactions-overview.pdf");
  }, [modifiedTransactions, selectedCurrency, sortedTransactions]);

  return (
    <OverviewContext.Provider
      value={{
        totalIncome,
        totalExpenses,
        netBalance,
        totalBudgetUsed,
        totalBudget,
        budgetUsagePercentage,
        incomeLabel,
        expensesLabel,
        totalIncomeBudget,
        totalExpensesBudget,
        incomeBudgetPercent,
        remainingIncome,
        expensesBudgetPercent,
        remainingExpenses,
        handleCSVExport,
        handlePDFExport,
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
};

export const useOverviewContext = () => useContext(OverviewContext);
