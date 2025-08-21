import useTransactionStore from "../../store/useTransactionStore";
import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import { useModalContext } from "../../context/ModalContext";
import { useFormContext } from "../../context/FormContext";
import { useCallback, useEffect } from "react";
import { handleEdit } from "../../utils/handleEdit";
import { useTransactionsContext } from "../../context/TransactionsContext";
import { useAuthContext } from "../../context/AuthContext";
import clsx from "clsx";

const TransactionTable = () => {
  const { currentUser } = useAuthContext();
  const { onOpenModal, setTransactionID } = useModalContext();
  const { deleteTransaction, setEditTransaction } = useTransactionStore();
  const {
    sortedTransactions,
    currentTransactions,
    handlePrev,
    handleNext,
    currentPage,
    totalPages,
    indexOfFirstTransaction,
    indexOfLastTransaction,
    formattedAmount,
  } = useTransactionsContext();

  const forms = useFormContext("transactions");
  const { setValue } = forms;

  // Scroll to top when page changes
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleEditTransaction = useCallback((id) => {
    handleEdit(
      id,
      "transactions",
      "edit",
      sortedTransactions,
      setValue,
      onOpenModal,
      setEditTransaction
    );
    setTransactionID(id);
  }, []);

  const handleDeleteTransaction = useCallback((id) => {
    deleteTransaction(currentUser.uid, "transactions", id);
  }, []);

  return (
    <div>
      {/* <ScrollToTop /> */}
      <h3 className="text-lg md:text-xl mb-8 text-[rgb(var(--color-muted))] font-semibold">
        Showing {indexOfFirstTransaction + 1}-
        {Math.min(indexOfLastTransaction, sortedTransactions.length)} of{" "}
        {sortedTransactions.length} transactions
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
        <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-gray-border))] text-[13px]">
          {currentTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="p-2">{transaction.date}</td>
              <td className="p-2">
                {transaction.description || "No description"}
              </td>
              <td className="p-2">{transaction.category}</td>
              <td
                className={clsx(
                  "p-2 font-medium",
                  transaction.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formattedAmount(transaction.amount)}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleEditTransaction(transaction.id)}
                  className="cursor-pointer text-[rgb(var(--color-brand-deep))] hover:text-[rgb(var(--color-brand))] transition mr-4"
                >
                  <HiOutlinePencil className="text-base" />
                </button>
                <button
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  className="cursor-pointer text-red-500 hover:text-red-600 transition"
                >
                  <HiOutlineTrash className="text-base" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="flex flex-col md:hidden gap-8">
        {currentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex flex-col gap-4">
            <h4 className="text-base font-semibold">
              {transaction.description || "No description"}
            </h4>

            <div className="flex items-center gap-1">
              <div className="grow grid grid-cols-3 gap-1 text-[13px]">
                <p className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[rgb(var(--color-muted))] rounded-full"></span>
                  <span>{transaction.date}</span>
                </p>
                <p className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[rgb(var(--color-muted))] rounded-full"></span>
                  <span>{transaction.category}</span>
                </p>
                <p className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[rgb(var(--color-muted))] rounded-full"></span>
                  <span
                    className={clsx(
                      "font-medium",
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formattedAmount(transaction.amount)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleEditTransaction(transaction.id)}
                className="cursor-pointer text-blue-500 hover:text-blue-600 transition mr-3"
              >
                <HiOutlinePencil className="text-base" />
              </button>
              <button
                onClick={() => handleDeleteTransaction(transaction.id)}
                className="cursor-pointer text-red-500 hover:text-red-600 transition"
              >
                <HiOutlineTrash className="text-base" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {sortedTransactions?.length > 10 && (
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-1 rounded bg-[rgb(var(--color-))] hover:scale-y-105 transition shadow text-[rgb(var(--color-muted))] disabled:opacity-50 font-medium text-sm cursor-pointer"
          >
            <span>&larr;</span> Prev
          </button>

          <span className="text-sm text-[rgb(var(--color-muted))] font-medium">
            Page {currentPage} out of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-1 rounded bg-[rgb(var(--color-))] hover:scale-y-105 transition shadow text-[rgb(var(--color-muted))] disabled:opacity-50 font-medium text-sm cursor-pointer"
          >
            Next <span>&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
