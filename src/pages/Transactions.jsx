import TransactionEmptyState from "../components/transaction/TransactionEmptyState";
import TransactionSummary from "../components/transaction/TransactionSummary";
import { motion, useReducedMotion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import TransactionTable from "../components/transaction/TransactionTable";
import Filter from "../components/transaction/Filter";
import Button from "../components/ui/Button";
import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import ScrollToTop from "../layout/ScrollToTop";
import { useTransactionsContext } from "../context/TransactionsContext";
import useCurrencyStore from "../store/useCurrencyStore";
import { showDemoReadOnlyToast, useDemoMode } from "../demo/useDemoMode";

const Transactions = () => {
  const isDemoMode = useDemoMode();
  const reducedMotion = useReducedMotion();
  const { onOpenModal } = useModalContext();
  const transactions = useTransactionStore((state) => state.transactions);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const {
    sortedTransactions,
    totalBalance,
    totalExpenses,
    totalIncome,
    netBalance,
    resetFilters,
  } = useTransactionsContext();

  const addTransaction = () => isDemoMode ? showDemoReadOnlyToast() : onOpenModal("transactions", "add");
  const hasTransactions = transactions.length > 0;
  
  const summary = [
    {
      label: "Total income",
      value: totalIncome,
      tone: "success",
    },
    {
      label: "Total expenses",
      value: totalExpenses,
      tone: "danger",
    },
    {
      label: "Total activity",
      value: totalBalance,
      tone: "primary",
    },
    {
      label: "Net balance",
      value: netBalance,
      tone: netBalance < 0 ? "danger" : "success",
    },
  ];
  
  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 12,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6"
    >
      <ScrollToTop />
      <header
        id="transactions-header"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold">Transactions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track all your expenses and income in one place.
          </p>
        </div>
        <Button onClick={addTransaction} aria-haspopup="dialog">
          <span className="flex items-center gap-2">
            <FiPlus aria-hidden="true" />
            Add transaction
          </span>
        </Button>
      </header>

      {hasTransactions && (
        <section id="transactions-filters" aria-label="Filter transactions">
          <Filter />
        </section>
      )}

      {sortedTransactions.length > 0 ? (
        <section
          id="transactions-list"
          aria-label="Transaction history"
          className="border border-border rounded-lg p-5"
        >
          <TransactionTable />
          <TransactionSummary
            summary={summary}
            selectedCurrency={selectedCurrency}
          />
        </section>
      ) : (
        <TransactionEmptyState
          hasTransactions={hasTransactions}
          resetFilters={resetFilters}
          addTransaction={addTransaction}
        />
      )}
    </motion.div>
  );
};

export default Transactions;
