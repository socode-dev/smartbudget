import useTransactionStore from "../store/useTransactionStore";

export const handleEdit = (
  id,
  label,
  mode = "edit",
  setValue,
  onOpenModal,
  setEditTransaction
) => {
  const { transactions, budgets, goals } = useTransactionStore.getState();

  const recordTypes = {
    transactions,
    budgets,
    goals,
  };

  const records = recordTypes[label];

  const record = records?.find((tx) => tx.id === id);

  if (!record && !label) return;

  const getTXDate = () => new Date(record.date).toISOString().split("T")[0];

  setValue("name", record.name);
  setValue("category", record.category);
  setValue("type", record.type);
  setValue("amount", record.amount.toFixed(2));
  setValue("date", getTXDate());
  setValue("description", record.description);

  onOpenModal(label, mode);
  setEditTransaction(record);
};
