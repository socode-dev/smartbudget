import TransactionPagination from "./TransactionPagination";
import TransactionMobileList from "./TransactionMobileList";
import TransactionDesktopTable from "./TransactionDesktopTable";
import TransactionAmount from "./TransactionAmount";
import { useState } from "react";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useTransactionsContext } from "../../context/TransactionsContext";
import useCurrencyStore from "../../store/useCurrencyStore";
import useTransactionStore from "../../store/useTransactionStore";
import useAuthStore from "../../store/useAuthStore";
import { showDemoReadOnlyToast, useDemoMode } from "../../demo/useDemoMode";
import Button from "../ui/Button";

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const TransactionTable = () => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const deleteTransaction = useTransactionStore(state => state.deleteTransaction);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const [deletingId, setDeletingId] = useState(null);

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

  const groups = currentTransactions.reduce((result, transaction) => {
    const date = new Date(transaction.date);
    const month = Number.isNaN(date.getTime())
      ? "Undated"
      : monthFormatter.format(date);
    const last = result.at(-1);
    if (last?.month === month) last.transactions.push(transaction);
    else
      result.push({
        month,
        transactions: [transaction],
      });
    return result;
  }, []);

  const formatCategory = (transaction) =>
    transaction.category === "Other" && transaction.name
      ? `Other (${transaction.name})`
      : transaction.category || "Uncategorized";

  const removeTransaction = async (transaction) => {
    if (isDemoMode) return showDemoReadOnlyToast();
    if (!user?.uid || deletingId) return;
    setDeletingId(transaction.id);

    try {
      await deleteTransaction(user.uid, "transactions", transaction.id);
    } catch {
      toast.error(
        "Could not delete the transaction. Please refresh and try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderAmount = (transaction) => (
    <TransactionAmount
      transaction={transaction}
      selectedCurrency={selectedCurrency}
    />
  );

  const renderActions = (transaction) => (
    <div className="flex shrink-0 justify-end gap-0.5">
      <Button
        variant="ghost"
        className="size-11 min-h-11 shrink-0 p-0!"
        onClick={() => handleEditTransaction(transaction.id)}
        title="Edit transaction"
        aria-haspopup="dialog"
        aria-label={`Edit transaction: ${transaction.description || formatCategory(transaction)}, ${transaction.date}`}
      >
        <FiEdit2 aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        className="size-11 min-h-11 shrink-0 p-0! text-danger"
        onClick={() => removeTransaction(transaction)}
        disabled={deletingId !== null}
        title="Delete transaction"
        aria-label={`Delete transaction: ${transaction.description || formatCategory(transaction)}, ${transaction.date}`}
      >
        <FiTrash2 aria-hidden="true" />
      </Button>
    </div>
  );

  return (
    <div className="min-w-0">
      <div className="pb-4">
        <h2
          className="text-sm font-medium"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {indexOfFirstTransaction + 1}-
          {Math.min(indexOfLastTransaction, sortedTransactions.length)} of{" "}
          {sortedTransactions.length} transactions
        </h2>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <TransactionDesktopTable
          groups={groups}
          formatCategory={formatCategory}
          renderAmount={renderAmount}
          renderActions={renderActions}
        />
      </div>
      <TransactionMobileList
        groups={groups}
        renderAmount={renderAmount}
        formatCategory={formatCategory}
        renderActions={renderActions}
      />
      <TransactionPagination
        handlePrev={handlePrev}
        currentPage={currentPage}
        totalPages={totalPages}
        handleNext={handleNext}
      />
    </div>
  );
};

export default TransactionTable;
