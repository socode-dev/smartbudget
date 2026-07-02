import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import { useTransactionsContext } from "../../context/TransactionsContext";
import clsx from "clsx";
import useCurrencyStore from "../../store/useCurrencyStore";
import { formatAmount } from "../../utils/formatAmount";
import useTransactionStore from "../../store/useTransactionStore";
import useAuthStore from "../../store/useAuthStore";
import ResponsiveTable from "../ui/ResponsiveTable";
import { showDemoReadOnlyToast, useDemoMode } from "../../demo/useDemoMode";

const TransactionTable = () => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const deleteTransaction = useTransactionStore(
    (state) => state.deleteTransaction
  );
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
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

  const formatCategory = (transaction) => {
    return transaction.category === "Other"
      ? `${transaction.category} (${transaction.name})`
      : transaction.category;
  };

  const renderAmount = (transaction) => (
    <span
      className={clsx(
        "font-medium",
        transaction.type === "income" ? "text-green-500" : "text-red-500"
      )}
    >
      {transaction.type === "income" ? "+" : "-"}
      {formatAmount(transaction.amount, selectedCurrency)}
    </span>
  );

  const renderActions = (transaction, mobile = false) => (
    <div className={clsx("flex items-center", mobile ? "gap-3" : "gap-4")}>
      <button
        onClick={() => handleEditTransaction(transaction.id)}
        title="Edit transaction"
        aria-label="Edit transaction"
        className={clsx(
          "cursor-pointer transition",
          mobile
            ? "text-blue-500 hover:text-blue-600"
            : "text-[rgb(var(--color-brand-deep))] hover:text-[rgb(var(--color-brand))]"
        )}
      >
        <HiOutlinePencil className="text-base" />
      </button>
      <button
        onClick={() => {
          if (isDemoMode) {
            showDemoReadOnlyToast();
            return;
          }

          deleteTransaction(user.uid, "transactions", transaction.id);
        }}
        title="Delete transaction"
        aria-label="Delete transaction"
        className="cursor-pointer text-red-500 transition hover:text-red-600"
      >
        <HiOutlineTrash className="text-base" />
      </button>
    </div>
  );

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (transaction) => transaction.date,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "description",
      header: "Description",
      render: (transaction) => transaction.description || "No description",
    },
    {
      key: "category",
      header: "Category",
      render: formatCategory,
    },
    {
      key: "amount",
      header: "Amount",
      render: renderAmount,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "actions",
      header: "",
      render: (transaction) => renderActions(transaction),
      cellClassName: "whitespace-nowrap",
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <h3 className="text-lg md:text-xl mb-8 text-[rgb(var(--color-muted))] font-semibold">
        Showing {indexOfFirstTransaction + 1}-
        {Math.min(indexOfLastTransaction, sortedTransactions.length)} of{" "}
        {sortedTransactions.length} transactions
      </h3>

      <ResponsiveTable
        columns={columns}
        rows={currentTransactions}
        getRowKey={(transaction) => transaction.id}
        emptyMessage="No transactions found."
        mobileRow={(transaction) => (
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-semibold">
              {transaction.description || "No description"}
            </h4>

            <div className="flex items-center gap-1">
              <div className="grid grow grid-cols-1 gap-2 text-[13px] min-[420px]:grid-cols-3">
                <p className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[rgb(var(--color-muted))]"></span>
                  <span>{transaction.date}</span>
                </p>
                <p className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[rgb(var(--color-muted))]"></span>
                  <span>{formatCategory(transaction)}</span>
                </p>
                <p className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[rgb(var(--color-muted))]"></span>
                  {renderAmount(transaction)}
                </p>
              </div>
              {renderActions(transaction, true)}
            </div>
          </div>
        )}
      />

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
