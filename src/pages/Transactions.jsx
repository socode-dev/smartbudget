import { useEffect } from "react";
import TransactionTable from "../components/transaction/TransactionTable";
import { FaPlus } from "react-icons/fa";
import Filter from "../components/transaction/Filter";
import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import ScrollToTop from "../layout/ScrollToTop";
import { useTransactionsContext } from "../context/TransactionsContext";
import useCurrencyStore from "../store/useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";
import { motion } from "framer-motion";
import useOnboardingStore from "../store/useOnboardingStore";

const Transactions = () => {
  const { onOpenModal } = useModalContext();
  const transactions = useTransactionStore((state) => state.transactions);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const {
    sortedTransactions,
    totalBalance,
    totalExpenses,
    totalIncome,
    netBalance,
  } = useTransactionsContext();

  const { setCurrentPage, startTourIfNotCompleted } = useOnboardingStore();

  useEffect(() => {
    setCurrentPage("transactions");
    // Start tour if not completed when navigating to transactions page
    const timer = setTimeout(() => {
      startTourIfNotCompleted("transactions");
    }, 500); // Small delay to ensure page is rendered

    return () => clearTimeout(timer);
  }, [setCurrentPage, startTourIfNotCompleted]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="px-5 md:px-10 py-8"
    >
      <ScrollToTop />
      <section className="flex items-center justify-between gap-8 mb-6">
        <div className="flex flex-col gap-5">
          <h2 className="text-3xl md:text-4xl font-semibold">Transactions</h2>
          <p className="text-base text-[rgb(var(--color-muted))]">
            Track all your expenses and income in one place.
          </p>
        </div>

        {transactions?.length > 0 && (
          <button
            onClick={() => onOpenModal("transactions", "add")}
            title="Add transaction"
            aria-label="Add transaction"
            className="bg-green-500 hover:bg-green-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-xl"
          >
            <FaPlus />
          </button>
        )}
      </section>

      {/* Filter Row (Search by note, date range and category) */}
      {transactions?.length > 0 && (
        <div>
          <Filter />
        </div>
      )}

      {sortedTransactions?.length > 0 && (
        <>
          {/* Transaction Table */}
          <TransactionTable />

          {/* Amount Summary */}
          <section className="w-fit grid grid-cols-2 md:grid-cols-4 items-center text-[12px] mt-8 gap-x-8 gap-y-4">
            <p className="text-[rgb(var(--color-muted))] text-sm font-medium">
              Total Income:{" "}
              <span className="font-semibold text-green-500 text-base">
                +{formatAmount(totalIncome, selectedCurrency)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))] text-sm font-medium">
              Total Expenses:{" "}
              <span className="font-semibold text-red-500 text-base">
                -{formatAmount(totalExpenses, selectedCurrency)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))] text-sm font-medium">
              Total Balance:{" "}
              <span className="font-semibold text-[rgb(var(--color-brand-deep))] text-base">
                {formatAmount(totalBalance, selectedCurrency)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))] text-sm font-medium">
              Net Balance:{" "}
              <span className="font-semibold text-yellow-500 text-base">
                {formatAmount(netBalance, selectedCurrency)}
              </span>
            </p>
          </section>
        </>
      )}

      {/* Show if filtered transaction is empty */}
      {sortedTransactions?.length === 0 && transactions.length > 0 && (
        <p className="text-center text-sm text-[rgb(var(--color-muted))]">
          The transaction you are looking for does not exist.
        </p>
      )}

      {/* Empty transaction state */}
      {transactions?.length === 0 && (
        <>
          <div
            id="transactions-empty-state"
            className="text-center text-sm text-[rgb(var(--color-muted))] flex flex-col items-center gap-4"
          >
            <h3 className="text-xl text-[rgb(var(--color-muted))] font-semibold mb-2">
              No transactions yet.
            </h3>
            <p className="text-base text-[rgb(var(--color-muted))]">
              Start by adding your first expense.
            </p>
          </div>

          <button
            id="add-first-transaction-btn"
            onClick={() => onOpenModal("transactions", "add")}
            className="mt-8 mx-auto bg-green-500 hover:bg-green-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-base flex items-center gap-2"
          >
            <FaPlus className="text-lg" />
            <span>Add First Transaction</span>
          </button>
        </>
      )}
    </motion.main>
  );
};

export default Transactions;
