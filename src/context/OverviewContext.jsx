import { createContext, useContext, useCallback, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { transactionTotal } from "../utils/transactionTotal";
import { getTotalBudgetSpent } from "../utils/getTotalBudgetSpent";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { format } from "date-fns";

const OverviewContext = createContext();

export const OverviewProvider = ({ children }) => {
  const { transactions, budgets, currencySymbol } = useTransactionStore();

  // Get last month and this month total income and expenses
  const income = useMemo(
    () => transactions.filter((tx) => tx.type === "income"),
    [transactions]
  );
  const expenses = useMemo(
    () => transactions.filter((tx) => tx.type === "expense"),
    [transactions]
  );

  // Get income using month argument
  const getTxTypeByMonth = useCallback((transaction, month) => {
    return transaction.filter((tx) => {
      const thisMonth = new Date().getMonth();
      const txMonth = new Date(tx.date).getMonth();
      const thisYear = new Date().getFullYear();
      const txYear = new Date(tx.date).getFullYear();

      if (month === "last") {
        return thisMonth !== txMonth && thisYear === txYear;
      } else if (month === "this") {
        return thisMonth === txMonth && thisYear === txYear;
      }
    });
  }, []);

  const lastMonthIncome = useMemo(
    () =>
      getTxTypeByMonth(income, "last").reduce(
        (total, tx) => total + tx.amount,
        0
      ),
    [income, getTxTypeByMonth]
  );
  const thisMonthIncome = useMemo(
    () =>
      getTxTypeByMonth(income, "this").reduce(
        (total, tx) => total + tx.amount,
        0
      ),
    [income, getTxTypeByMonth]
  );

  const incomePercentage = useMemo(
    () => ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100,
    [thisMonthIncome, lastMonthIncome]
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
            1
          )}% from last month`;
  }

  const lastMonthExpense = useMemo(
    () =>
      getTxTypeByMonth(expenses, "last").reduce(
        (total, expense) => total + expense.amount,
        0
      ),
    [expenses, getTxTypeByMonth]
  );
  const thisMonthExpense = useMemo(
    () =>
      getTxTypeByMonth(expenses, "this").reduce(
        (total, expense) => total + expense.amount,
        0
      ),
    [expenses, getTxTypeByMonth]
  );

  const expensesPercentage = useMemo(
    () => ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100,
    [thisMonthExpense, lastMonthExpense]
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
    [transactions]
  );

  const netBalance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  // Get total budget limit
  const totalBudget = useMemo(
    () => budgets.reduce((total, budget) => total + budget.amount, 0),
    [budgets]
  );

  // get total budget used
  const totalBudgetUsed = useMemo(
    () => getTotalBudgetSpent(transactions, budgets, "all"),
    [getTotalBudgetSpent]
  );

  const budgetUsagePercentage = Math.ceil(
    (totalBudgetUsed / totalBudget) * 100
  );

  const incomeBudget = budgets.filter((tx) => tx.type === "income");
  const expensesBudget = budgets.filter((tx) => tx.type === "expense");

  const totalIncomeBudget = incomeBudget.reduce(
    (sum, budget) => sum + budget.amount,
    0
  );
  const totalExpensesBudget = expensesBudget.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const incomeBudgetAchieved = useMemo(
    () => getTotalBudgetSpent(transactions, budgets, "income"),
    [getTotalBudgetSpent]
  );
  const expensesBudgetSpent = useMemo(
    () => getTotalBudgetSpent(transactions, budgets, "expense"),
    [getTotalBudgetSpent]
  );

  const incomeBudgetPercent = (incomeBudgetAchieved / totalIncomeBudget) * 100;
  const remainingIncome = totalIncomeBudget - incomeBudgetAchieved;
  const expensesBudgetPercent =
    (expensesBudgetSpent / totalExpensesBudget) * 100;
  const remainingExpenses = totalExpensesBudget - expensesBudgetSpent;

  // Sort transaction by date for exporting
  const sortedTransactions = useMemo(
    () =>
      transactions.sort(
        (a, b) => new Date(b.date).getMonth() - new Date(a.date).getMonth()
      ),
    [transactions]
  );

  // Return needed key-value pairs needed for pdf and csv format
  const modifiedTransactions = useMemo(
    () =>
      sortedTransactions.map((transaction) => {
        return {
          Date: format(new Date(transaction.date), "MMM yyyy"),
          Name: transaction.name,
          Type: transaction.type,
          Note: transaction.description || "-",
          Amount: `${transaction.type === "income" ? "+" : "-"}${
            transaction.currencySymbol
          }${transaction.amount.toFixed(2)}`,
        };
      }),
    [sortedTransactions]
  );

  // Handler for exporting via CSV
  const handleCSVExport = useCallback(() => {
    // Convert sorted transaction to CSV
    const csvData = Papa.unparse(modifiedTransactions);
    // Create a Blob and trigger download
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const temporaryLink = document.createElement("a");
    temporaryLink.setAttribute("href", url);
    temporaryLink.setAttribute("download", "transactions-overview.csv");
    temporaryLink.style.visibility = "hidden";
    document.body.appendChild(temporaryLink);
    temporaryLink.click();
    document.body.removeChild(temporaryLink);
  }, [modifiedTransactions]);

  // Handler for exporting via PDF
  const handlePDFExport = useCallback(() => {
    const doc = new jsPDF();

    // Add PDF heading and style
    doc.setFontSize(23);
    doc.text("Full Transaction Activities", 25, 15);

    // Set table columns and and rows value for PDF
    const tableColumn = Object.keys(modifiedTransactions.at(0));
    const tableRows = modifiedTransactions.map((transaction) => {
      return Object.values(transaction);
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
      showHead: "firstPage",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
    });

    // Save the PDF
    doc.save("transactions-overview.pdf");
  }, [modifiedTransactions]);

  return (
    <OverviewContext.Provider
      value={{
        totalIncome,
        totalExpenses,
        netBalance,
        totalBudgetUsed,
        totalBudget,
        budgetUsagePercentage,
        currencySymbol,
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
