import useTransactionStore from "../store/useTransactionStore";

export const getAmountSpent = (
  key,
  date,
  type,
  transactions = useTransactionStore.getState().transactions,
) => {
  const budgetDate = new Date(date);
  const spendingRecords = transactions?.filter(
    (tx) =>
      tx.categoryKey === key &&
      tx.type === type &&
      new Date(tx.date).getMonth() === budgetDate.getMonth() &&
      new Date(tx.date).getFullYear() === budgetDate.getFullYear(),
  );

  return spendingRecords.reduce((acc, tx) => acc + Number(tx.amount), 0);
};
