import { createContext, useContext, useCallback, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { transactionTotal } from "../utils/transactionTotal";

const OverviewContext = createContext();

export const OverviewProvider = ({ children }) => {
  const { transactions, budgets, currencySymbol } = useTransactionStore();

  // Get last month and this month total income and expenses
  const incomes = useMemo(
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
      getTxTypeByMonth(incomes, "last").reduce(
        (total, income) => total + income.amount,
        0
      ),
    [incomes, getTxTypeByMonth]
  );
  const thisMonthIncome = useMemo(
    () =>
      getTxTypeByMonth(incomes, "this").reduce(
        (total, income) => total + income.amount,
        0
      ),
    [incomes, getTxTypeByMonth]
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

  // Get budget total spent
  const getTotalBudgetSpent = useCallback(() => {
    // Filter transactions that belong to budget categories AND same month as budgets
    const budgetTransactions = transactions.filter((tx) => {
      // Check if transaction category matches any budget category
      const matchingBudget = budgets.find(
        (budget) => budget.categoryKey === tx.categoryKey
      );

      if (!matchingBudget) return false;

      // Check if transaction date is in the same month as budget date
      const txDate = new Date(tx.date);
      const budgetDate = new Date(matchingBudget.date);

      return (
        txDate.getMonth() === budgetDate.getMonth() &&
        txDate.getFullYear() === budgetDate.getFullYear()
      );
    });

    // Calculate total spent on budget categories
    const totalBudgetSpent = budgetTransactions.reduce(
      (total, tx) => total + tx.amount,
      0
    );

    return totalBudgetSpent;
  }, [transactions, budgets]);

  // get total budget used
  const totalBudgetUsed = useMemo(
    () => getTotalBudgetSpent(),
    [getTotalBudgetSpent]
  );

  const budgetUsagePercentage = Math.ceil(
    (totalBudgetUsed / totalBudget) * 100
  );

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
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
};

export const useOverviewContext = () => useContext(OverviewContext);
