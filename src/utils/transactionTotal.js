export const transactionTotal = (transactions) => {
  const totalIncome = transactions?.reduce(
    (acc, tx) => (tx.type === "income" ? acc + Number(tx.amount) : acc),
    0
  );
  const totalExpenses = transactions?.reduce(
    (acc, tx) => (tx.type === "expense" ? acc + Number(tx.amount) : acc),
    0
  );
  const totalBalance = transactions?.reduce(
    (acc, tx) => acc + Number(tx.amount),
    0
  );

  return { totalIncome, totalExpenses, totalBalance };
};
