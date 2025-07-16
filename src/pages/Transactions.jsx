import { useState, useEffect } from "react";
// import { clearTransactions } from "../data/idbTransactions";
import TransactionTable from "../components/transaction/TransactionTable";
import { FaPlus } from "react-icons/fa";
import Filter from "../components/transaction/Filter";
import useTransactionStore from "../store/useTransactionStore";
import AddExpense from "../components/modals/AddExpense";

const Transactions = () => {
  const {
    loadTransactions,
    setDisplayModal,
    displayModal,
    transactions,
    currencySymbol,
  } = useTransactionStore();
  const [searchDescription, setSearchDescription] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  console.log(transactions);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      await loadTransactions();
    };
    load();

    // Cleanup to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
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
  console.log(filteredTransactions);

  // const handleClearTransactions = async () => {
  //   await clearTransactions();
  //   setTransactions([]);
  // };

  const totalIncome = filteredTransactions.reduce((acc, tx) => {
    if (tx.type === "income") {
      return acc + Number(tx.amount);
    }
    return acc;
  }, 0);

  const totalExpenses = filteredTransactions.reduce((acc, tx) => {
    if (tx.type === "expense") {
      return acc + Number(tx.amount);
    }
    return acc;
  }, 0);

  const netBalance = totalIncome - totalExpenses;

  return (
    <main className="my-8">
      <h2 className="text-2xl font-semibold">Transactions</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mt-2 mb-6">
        Track all your expenses and income in one place.
      </p>

      {filteredTransactions.length > 0 && (
        <>
          {/* Filter Row (Search by note, date range and category) */}
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
          {/* Transaction Table */}
          <TransactionTable transactions={filteredTransactions} />

          {/* Amount Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 items-center text-[14px] mt-8 gap-4">
            <p className="text-[rgb(var(--color-muted))]">
              Total Income:{" "}
              <span className="font-semibold text-green-500 text-sm">
                +{currencySymbol}
                {totalIncome.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Total Expenses:{" "}
              <span className="font-semibold text-red-500 text-sm">
                -{currencySymbol}
                {totalExpenses.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Total Balance:{" "}
              <span className="font-semibold text-blue-500 text-sm">
                {currencySymbol}
                {netBalance.toFixed(2)}
              </span>
            </p>
            <p className="text-[rgb(var(--color-muted))]">
              Net Balance:{" "}
              <span className="font-semibold text-yellow-500 text-sm">
                {currencySymbol}
                {netBalance.toFixed(2)}
              </span>
            </p>
          </div>
        </>
      )}

      {/* <button onClick={handleClearTransactions}>Clear Transactions</button> */}

      {/* Empty transaction state */}
      {filteredTransactions.length === 0 && (
        <div className="text-center text-sm text-[rgb(var(--color-muted))] flex flex-col items-center gap-4">
          <h3 className="text-xl text-[rgb(var(--color-muted))] font-semibold mb-2">
            No transactions yet.
          </h3>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Start by adding your first expense.
          </p>
          <button
            onClick={() => setDisplayModal(true)}
            className="bg-green-500 hover:bg-green-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
          >
            <FaPlus />
            <span>Add Expense</span>
          </button>
        </div>
      )}

      {/* Add Expense Modal */}
      {displayModal && <AddExpense />}
    </main>
  );
};

export default Transactions;
