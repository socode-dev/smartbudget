import useTransactionStore from "../../store/useTransactionStore";
import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import { useModalContext } from "../../context/ModalContext";
import { useFormContext } from "../../context/FormContext";
import { useMemo } from "react";

const TransactionTable = ({ transactions }) => {
  const { deleteTransaction, setEditTransaction, editTransaction } =
    useTransactionStore();
  const { onOpenModal } = useModalContext();

  const forms = useFormContext("transactions");
  const { setValue } = forms;

  // Sort transactions by date (latest first)
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  const handleEditTransaction = (id, label) => {
    const transaction = transactions.find((tx) => tx.id === id);
    if (!transaction && !label) return;

    setValue("name", transaction.name);
    setValue("category", transaction.category);
    setValue("type", transaction.type);
    setValue("amount", transaction.amount.toFixed(2));
    setValue("date", transaction.date);
    setValue("description", transaction.description);

    onOpenModal(label, "edit");
    setEditTransaction(transaction);
  };
  console.log(editTransaction);

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id, "transactions");
  };

  return (
    <div className="">
      <h3 className="text-lg text-[rgb(var(--color-muted))] font-semibold mb-4">
        History ({sortedTransactions.length})
      </h3>

      {/* Tablet & Desktop View */}
      <table className="hidden md:table min-w-full divide-y divide-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] rounded-lg shadow-sm p-4 overflow-hidden">
        <thead className="bg-[rgb(var(--color-bg-card))]">
          <tr>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              Date
            </th>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              Description
            </th>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              Category
            </th>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              Amount
            </th>
            <th className="text-left text-[rgb(var(--color-muted))] p-2"></th>
          </tr>
        </thead>
        <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-gray-border))] text-[12px]">
          {sortedTransactions.map((transaction) => (
            <>
              <tr key={transaction.id}>
                <td className="p-2">{transaction.date}</td>
                <td className="p-2">
                  {transaction.description || "No description"}
                </td>
                <td className="p-2">{transaction.category}</td>
                <td
                  className={`p-2 ${
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {`${transaction.currencySymbol}${transaction.amount?.toFixed(
                    2
                  )}`}
                </td>
                <td className="p-2">
                  <button
                    onClick={() =>
                      handleEditTransaction(transaction.id, "transactions")
                    }
                    className="cursor-pointer text-blue-500 hover:text-blue-600 transition mr-2"
                  >
                    <HiOutlinePencil className="text-sm " />
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="cursor-pointer text-red-500 hover:text-red-600 transition"
                  >
                    <HiOutlineTrash className="text-sm " />
                  </button>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="flex flex-col md:hidden gap-5">
        {sortedTransactions.map((transaction) => (
          <div key={transaction.id} className="flex flex-col gap-2">
            <h4 className="text-[14px] font-semibold">
              {transaction.description || "No description"}
            </h4>

            <div className="flex items-center gap-2">
              <div className="grow grid grid-cols-3 gap-2">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[rgb(var(--color-muted))] rounded-full"></span>
                  <span className="text-[12px]">{transaction.date}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[rgb(var(--color-muted))] rounded-full"></span>
                  <span className="text-[12px]">{transaction.category}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[rgb(var(--color-muted))] rounded-full"></span>
                  <span
                    className={`text-[12px] ${
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {`${transaction.currencySymbol}${transaction.amount.toFixed(
                      2
                    )}`}
                  </span>
                </p>
              </div>
              <button
                onClick={() =>
                  handleEditTransaction(transaction.id, "transactions")
                }
                className="cursor-pointer text-blue-500 hover:text-blue-600 transition mr-2"
              >
                <HiOutlinePencil className="text-sm " />
              </button>
              <button
                onClick={() => handleDeleteTransaction(transaction.id)}
                className="cursor-pointer text-red-500 hover:text-red-600 transition"
              >
                <HiOutlineTrash className="text-sm " />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTable;
