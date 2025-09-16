import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import { useTransactionsContext } from "../../context/TransactionsContext";
import clsx from "clsx";
import useCurrencyStore from "../../store/useCurrencyStore";
import { formatAmount } from "../../utils/formatAmount";
import useTransactionStore from "../../store/useTransactionStore";
import useAuthStore from "../../store/useAuthStore";

const TransactionTable = () => {
  const { currentUser: user } = useAuthStore();
  const { deleteTransaction } = useTransactionStore();
  const { selectedCurrency } = useCurrencyStore();
  const {
    sortedTransactions,
    currentTransactions,
    handlePrev,
    handleNext,
    currentPage,
    totalPages,
    indexOfFirstTransaction,
    indexOfLastTransaction,
    handleEditTransaction,
  } = useTransactionsContext();

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
              <td className="p-2">
                {transaction.category === "Other"
                  ? `${transaction.category} (${transaction.name})`
                  : transaction.category}
              </td>
              <td
                className={clsx(
                  "p-2 font-medium",
                  transaction.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatAmount(transaction.amount, selectedCurrency)}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleEditTransaction(transaction.id)}
                  className="cursor-pointer text-[rgb(var(--color-brand-deep))] hover:text-[rgb(var(--color-brand))] transition mr-4"
                >
                  <HiOutlinePencil className="text-base" />
                </button>
                <button
                  onClick={() =>
                    deleteTransaction(user.uid, "transactions", transaction.id)
                  }
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
                  <span>
                    {transaction.category === "Other"
                      ? `${transaction.category} (${transaction.name})`
                      : transaction.category}
                  </span>
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
                    {formatAmount(transaction.amount, selectedCurrency)}
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
                onClick={() =>
                  deleteTransaction(user.uid, "transactions", transaction.id)
                }
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
