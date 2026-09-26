export const getTotalBudgetSpent = (transactions = [], budgets = [], type) => {
  
  return transactions.reduce((total, transaction) => {
    const date = new Date(transaction.date);
    const matches = budgets.some((budget) => {
      const budgetDate = new Date(budget.date);
  
      return (
        (type === "all" || budget.type === type) &&
        budget.categoryKey === transaction.categoryKey &&
        budget.type === transaction.type &&
        date.getMonth() === budgetDate.getMonth() &&
        date.getFullYear() === budgetDate.getFullYear()
      );
    });
  
    return matches ? total + Number(transaction.amount) : total;
  }, 0);
};
