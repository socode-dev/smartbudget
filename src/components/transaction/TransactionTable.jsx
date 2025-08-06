import useTransactionStore from "../../store/useTransactionStore";
import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import { useModalContext } from "../../context/ModalContext";
import { useFormContext } from "../../context/FormContext";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { handleEdit } from "../../utils/handleEdit";
import { useTransactionsContext } from "../../context/TransactionsContext";
// import ScrollToTop from "../../layout/ScrollToTop";

const TransactionTable = () => {
  const tableContainerRef = useRef(null);
  const { onOpenModal } = useModalContext();
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
      transactions,
      setValue,
      onOpenModal,
      setEditTransaction
    );
  }, []);

  const handleDeleteTransaction = useCallback((id) => {
    deleteTransaction(id, "transactions");
  }, []);

  return (
    <div>
      {/* <ScrollToTop /> */}
      <h3 className="text-base md:text-lg mb-6 text-[rgb(var(--color-muted))] font-semibold">
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
        <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-gray-border))] text-[12px]">
          {currentTransactions.map((transaction) => (
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
                  onClick={() => handleEditTransaction(transaction.id)}
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
          ))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="flex flex-col md:hidden gap-5">
        {currentTransactions.map((transaction) => (
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
                    {`${
                      transaction.currencySymbol
                    }${transaction.amount?.toFixed(2)}`}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleEditTransaction(transaction.id)}
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-1 rounded bg-[rgb(var(--color-))] hover:scale-y-105 transition shadow text-[rgb(var(--color-muted))] disabled:opacity-50 font-medium text-xs cursor-pointer"
        >
          <span>&larr;</span> Prev
        </button>

        <span className="text-sm text-[rgb(var(--color-muted))] font-medium">
          Page {currentPage} out of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-1 rounded bg-[rgb(var(--color-))] hover:scale-y-105 transition shadow text-[rgb(var(--color-muted))] disabled:opacity-50 font-medium text-xs cursor-pointer"
        >
          Next <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionTable;
