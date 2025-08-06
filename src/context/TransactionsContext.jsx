import {
  useContext,
  createContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import useTransactionStore from "../store/useTransactionStore";
import { transactionTotal } from "../utils/transactionTotal";

const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
  const { transactions } = useTransactionStore();
  const [searchDescription, setSearchDescription] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // Filter transaction by description search, date range, category and type
  const filteredTransactions = useMemo(
    () =>
      transactions?.filter((tx) => {
        const matchesDescription =
          searchDescription === ""
            ? true
            : tx?.description
                ?.toLowerCase()
                .includes(searchDescription?.toLowerCase());
        const matchesCategory =
          categoryFilter === "all"
            ? true
            : tx?.category
                ?.toLowerCase()
                .includes(categoryFilter?.toLowerCase());
        const matchesType =
          typeFilter === "all" ? true : tx?.type === typeFilter;

        // Date filtering
        const txDate = tx?.date ? new Date(tx.date) : null;
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        const matchesFrom = fromDate
          ? txDate
            ? txDate >= fromDate
            : false
          : true;
        const matchesTo = toDate ? (txDate ? txDate <= toDate : false) : true;

        return (
          matchesDescription &&
          matchesCategory &&
          matchesType &&
          matchesFrom &&
          matchesTo
        );
      }),
    [
      transactions,
      searchDescription,
      dateFrom,
      dateTo,
      typeFilter,
      categoryFilter,
    ]
  );

  // Sort transactions by date (latest first)
  const sortedTransactions = useMemo(
    () =>
      filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions]
  );

  // Get total income, expenses, and balance
  const { totalBalance, totalExpenses, totalIncome } = useMemo(
    () => transactionTotal(sortedTransactions),
    [sortedTransactions]
  );

  const netBalance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);

  // Claculate current page slice
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Handle navigation
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const value = {
    sortedTransactions,
    currentTransactions,
    handlePrev,
    handleNext,
    currentPage,
    totalPages,
    indexOfFirstTransaction,
    indexOfLastTransaction,
    totalBalance,
    totalExpenses,
    totalIncome,
    netBalance,
    searchDescription,
    setSearchDescription,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactionsContext = () => useContext(TransactionsContext);
