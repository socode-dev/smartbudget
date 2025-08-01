import { useCallback, useMemo, useState } from "react";
import TransactionTable from "../components/transaction/TransactionTable";
import { FaPlus } from "react-icons/fa";
import Filter from "../components/transaction/Filter";
import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import { transactionTotal } from "../utils/transactionTotal";

const Transactions = () => {
  const { onOpenModal } = useModalContext();
  const { transactions, currencySymbol } = useTransactionStore();
  const [searchDescription, setSearchDescription] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesDescription =
      searchDescription === ""
        ? true
        : tx?.description
            ?.toLowerCase()
            .includes(searchDescription?.toLowerCase());
    const matchesCategory =
      categoryFilter === "all"
        ? true
        : tx?.category?.toLowerCase().includes(categoryFilter?.toLowerCase());
    const matchesType = typeFilter === "all" ? true : tx?.type === typeFilter;

    // Date filtering
    const txDate = tx?.date ? new Date(tx.date) : null;
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesFrom = fromDate ? (txDate ? txDate >= fromDate : false) : true;
    const matchesTo = toDate ? (txDate ? txDate <= toDate : false) : true;

    return (
      matchesDescription &&
      matchesCategory &&
      matchesType &&
      matchesFrom &&
      matchesTo
    );

    // return matchesDescription && matchesCategory && matchesType;
  });

  // Get total income, expenses, and balance
  const { totalBalance, totalExpenses, totalIncome } = useMemo(
    () => transactionTotal(filteredTransactions),
    [filteredTransactions]
  );

  const netBalance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  return (
    <main className="my-8">
      <h2 className="text-2xl font-semibold">Transactions</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mt-2 mb-6">
        Track all your expenses and income in one place.
      </p>

      {/* Filter Row (Search by note, date range and category) */}
      {transactions.length > 0 && (
        <Filter
          searchDescription={searchDescription}
          setSearchDescription={setSearchDescription}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
      )}

      {filteredTransactions?.length > 0 && (
        <>
          {/* Transaction Table */}
          <TransactionTable transactions={filteredTransactions} />

          {/* Amount Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 items-center text-[14px] mt-8 gap-4">
            <p className="text-[rgb(var(--color-muted))]">
              Total Income:{" "}
              <span className="font-semibold text-green-500 text-sm">
                +{currencySymbol}
                {totalIncome?.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Total Expenses:{" "}
              <span className="font-semibold text-red-500 text-sm">
                -{currencySymbol}
                {totalExpenses?.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Total Balance:{" "}
              <span className="font-semibold text-blue-500 text-sm">
                {currencySymbol}
                {totalBalance?.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Net Balance:{" "}
              <span className="font-semibold text-yellow-500 text-sm">
                {currencySymbol}
                {netBalance?.toFixed(2)}
              </span>
            </p>
          </div>
        </>
      )}

      {/* Show if filtered transaction is empty */}
      {filteredTransactions?.length === 0 && transactions.length > 0 && (
        <p className="text-center text-sm text-[rgb(var(--color-muted))]">
          The transaction you are looking for does not exist.
        </p>
      )}

      {/* Empty transaction state */}
      {transactions?.length === 0 && (
        <div className="text-center text-sm text-[rgb(var(--color-muted))] flex flex-col items-center gap-4">
          <h3 className="text-xl text-[rgb(var(--color-muted))] font-semibold mb-2">
            No transactions yet.
          </h3>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Start by adding your first expense.
          </p>
        </div>
      )}
      <button
        onClick={() => onOpenModal("transactions", "add")}
        className={`mt-8 ${
          !filteredTransactions?.length && "mx-auto"
        } bg-green-500 hover:bg-green-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2`}
      >
        <FaPlus />
        <span>
          {transactions?.length > 0
            ? "Add Transaction"
            : "Add First Transaction"}
        </span>
      </button>
    </main>
  );
};

export default Transactions;
