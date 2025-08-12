import { useCallback, useMemo, useState } from "react";
import TransactionTable from "../components/transaction/TransactionTable";
import { FaPlus } from "react-icons/fa";
import Filter from "../components/transaction/Filter";
import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import ScrollToTop from "../layout/ScrollToTop";
import { useTransactionsContext } from "../context/TransactionsContext";

const Transactions = () => {
  const { onOpenModal } = useModalContext();
  const {
    sortedTransactions,
    totalBalance,
    totalExpenses,
    totalIncome,
    netBalance,
  } = useTransactionsContext();
  const { currencySymbol, transactions } = useTransactionStore();

  return (
    <main className="my-8">
      <ScrollToTop />
      <section className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-sm text-[rgb(var(--color-muted))] mt-2 ">
            Track all your expenses and income in one place.
          </p>
        </div>

        <button
          onClick={() => onOpenModal("transactions", "add")}
          title="Add transaction"
          className="bg-green-500 hover:bg-green-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <FaPlus />
        </button>
      </section>

      {/* Filter Row (Search by note, date range and category) */}
      {transactions.length > 0 && <Filter />}

      {sortedTransactions?.length > 0 && (
        <>
          {/* Transaction Table */}
          <TransactionTable />

          {/* Amount Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 items-center text-[12px] mt-8 gap-4">
            <p className="text-[rgb(var(--color-muted))]">
              Total Income:{" "}
              <span className="font-semibold text-green-500 text-xs">
                +{currencySymbol}
                {totalIncome?.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Total Expenses:{" "}
              <span className="font-semibold text-red-500 text-xs">
                -{currencySymbol}
                {totalExpenses?.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Total Balance:{" "}
              <span className="font-semibold text-blue-500 text-xs">
                {currencySymbol}
                {totalBalance?.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Net Balance:{" "}
              <span className="font-semibold text-yellow-500 text-xs">
                {currencySymbol}
                {netBalance?.toFixed(2)}
              </span>
            </p>
          </div>
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
          <div className="text-center text-sm text-[rgb(var(--color-muted))] flex flex-col items-center gap-4">
            <h3 className="text-xl text-[rgb(var(--color-muted))] font-semibold mb-2">
              No transactions yet.
            </h3>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              Start by adding your first expense.
            </p>
          </div>

          <button
            onClick={() => onOpenModal("transactions", "add")}
            className="mt-8 mx-auto bg-green-500 hover:bg-green-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
          >
            <FaPlus />
            <span>
              {transactions?.length > 0
                ? "Add Transaction"
                : "Add First Transaction"}
            </span>
          </button>
        </>
      )}
    </main>
  );
};

export default Transactions;
