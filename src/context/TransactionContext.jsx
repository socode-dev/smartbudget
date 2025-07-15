import { createContext, useContext, useState } from "react";
// import useCurrencyStore from "../../store/useCurrencyStore";
// import CURRENCY_SYMBOLS from "../../data/currencySymbols";
// import { addTransaction } from "../../data/idbTransactions";
// import { toast } from "react-hot-toast";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const onOpenExpenseModal = () => {
    setIsAddExpenseModalOpen(true);
  };

  const onCloseExpenseModal = () => {
    setIsAddExpenseModalOpen(false);
  };

  return (
    <TransactionContext.Provider
      value={{
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen,
        onOpenExpenseModal,
        onCloseExpenseModal,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => useContext(TransactionContext);
