import { createContext, useContext, useCallback, useMemo } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { transactionTotal } from "../utils/transactionTotal";
import { getTotalBudgetSpent } from "../utils/getTotalBudgetSpent";

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
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
};

export const useOverviewContext = () => useContext(OverviewContext);
