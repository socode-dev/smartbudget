import {
  useContext,
  createContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import useTransactionStore from "../store/useTransactionStore";
import { transactionTotal } from "../utils/transactionTotal";
import { handleEdit } from "../utils/handleEdit";
import { useFormContext } from "./FormContext";
import { useModalContext } from "./ModalContext";

const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
  const { onOpenModal, setTransactionID } = useModalContext();
  const transactions = useTransactionStore((state) => state.transactions);
  const setEditTransaction = useTransactionStore(
    (state) => state.setEditTransaction
  );
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    category: "all",
    type: "all",
  });

  const forms = useFormContext("transactions");
  const { setValue } = forms;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // Scroll to top when page changes
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Filter transaction by description search, date range, category and type
  const filteredTransactions = useMemo(
    () =>
      transactions?.filter((tx) => {
        const matchesDescription =
          filters.search === ""
            ? true
            : tx?.description
                ?.toLowerCase()
                .includes(filters.search?.toLowerCase());
        const matchesCategory =
          filters.category === "all"
            ? true
            : tx?.category
                ?.toLowerCase()
                .includes(filters.category?.toLowerCase());
        const matchesType =
          filters.type === "all" ? true : tx?.type === filters.type;

        // Date filtering
        const txDate = tx?.date ? new Date(tx.date) : null;
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;
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
      filters.search,
      filters.fromDate,
      filters.toDate,
      filters.type,
      filters.category,
    ]
  );

  // Sort transactions by date (latest first)
  const sortedTransactions = useMemo(
    () => filteredTransactions?.sort((a, b) => b.createdAt - a.createdAt),
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

  const totalPages = Math.ceil(
    sortedTransactions?.length / transactionsPerPage
  );

  // Calculate current page slice
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = sortedTransactions?.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Handle navigation
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleEditTransaction = useCallback((id) => {
    handleEdit(
      id,
      "transactions",
      "edit",
      setValue,
      onOpenModal,
      setEditTransaction
    );
    setTransactionID(id);
  }, []);

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
    filters,
    setFilters,
    handleEditTransaction,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactionsContext = () => useContext(TransactionsContext);
