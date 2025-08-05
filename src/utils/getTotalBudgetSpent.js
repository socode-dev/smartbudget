export const getTotalBudgetSpent = (transactions, budgets, type) => {
  // Filter transactions that belong to budget categories AND same month as budgets
  const budgetTransactions = transactions.filter((tx) => {
    // Check if transaction category matches any budget category
    const matchingBudget = budgets.find((budget) => {
      if (type && type === budget.type) {
        return budget.categoryKey === tx.categoryKey;
      } else if (type === "all") {
        return budget.categoryKey === tx.categoryKey;
      }
    });

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
};
