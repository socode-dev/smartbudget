// import useTransactionStore from "../store/useTransactionStore";

export const handleEdit = (
  id,
  label,
  mode = "edit",
  records,
  setValue,
  onOpenModal,
  setEditTransaction
) => {
  //   const { setEditTransaction } = useTransactionStore();

  const record = records.find((tx) => tx.id === id);
  if (!record && !label) return;

  setValue("name", record.name);
  setValue("category", record.category);
  setValue("type", record.type);
  setValue("amount", record.amount.toFixed(2));
  setValue("date", record.date);
  setValue("description", record.description);

  onOpenModal(label, mode);
  setEditTransaction(record);
};
