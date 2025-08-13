import { useCallback, useMemo, useState } from "react";
import { HiOutlineTrash, HiOutlinePencil, HiOutlinePlus } from "react-icons/hi";
import { useModalContext } from "../context/ModalContext";
import useTransactionStore from "../store/useTransactionStore";
import { useFormContext } from "../context/FormContext";
import { handleEdit } from "../utils/handleEdit";
import { format } from "date-fns";
import ScrollToTop from "../layout/ScrollToTop";
import useCurrencyStore from "../store/useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";

const Budgets = () => {
  const [searchName, setSearchName] = useState("");
  const { onOpenModal, setTransactionID } = useModalContext();
  const { budgets, transactions, deleteTransaction, setEditTransaction } =
    useTransactionStore();
  const forms = useFormContext("budgets");
  const { setValue } = forms;
  const { selectedCurrency } = useCurrencyStore();

  const formattedAmount = useCallback((amount) => {
    const formatCurrency = formatAmount(selectedCurrency);
    const amountFormat = formatCurrency.format(amount);

    return amountFormat;
  });

  const filteredBudgets = useMemo(
    () =>
      budgets.filter((budget) => {
        const matchesName =
          searchName === ""
            ? true
            : budget?.name?.toLowerCase().includes(searchName?.toLowerCase());

        return matchesName;
      }),
    [budgets, searchName]
  );

  const handleEditBudget = (id) => {
    handleEdit(
      id,
      "budgets",
      "edit",
      budgets,
      setValue,
      onOpenModal,
      setEditTransaction
    );
    setTransactionID(id);
  };

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id, "budgets");
  };

  const getAmountSpent = useCallback(
    (key, date) => {
      const budgetDate = new Date(date);
      const spendingRecords = transactions.filter(
        (tx) =>
          tx.categoryKey === key &&
          new Date(tx.date).getMonth() === budgetDate.getMonth() &&
          new Date(tx.date).getFullYear() === budgetDate.getFullYear()
      );

      return spendingRecords.reduce((acc, tx) => acc + tx.amount, 0);
    },
    [transactions]
  );

  const getProgressBackground = (percentage, type) => {
    if (percentage > 90 && type === "expense") {
      return "bg-red-500";
    } else if (percentage > 90 && type === "income") {
      return "bg-green-500";
    } else if (percentage > 50 && type !== "income") {
      return "bg-amber-500";
    } else {
      return "bg-[rgb(var(--color-brand))]";
    }
  };

  return (
    <main className="p-6">
      <ScrollToTop />
      <section className="w-full flex justify-center items-center">
        <div className="w-full">
          <h2 className="text-4xl md:text-5xl font-semibold mb-2">Budgets</h2>
          <p className="text-base text-[rgb(var(--color-muted))] mb-4">
            Monitor and manage your category limits
          </p>
        </div>

        {filteredBudgets.length > 0 && (
          <button
            onClick={() => onOpenModal("budgets", "add")}
            className="bg-blue-500 hover:bg-blue-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-xl font-semibold flex items-center mx-auto gap-2"
          >
            <HiOutlinePlus />
          </button>
        )}
      </section>

      {budgets.length > 0 && (
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full mx-auto mb-6 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-sm p-2"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Groceries Category */}

        {filteredBudgets.map((budget) => {
          const monthLabel = format(new Date(budget.date), "MMMM yyyy");
          const budgetLimit = budget.amount;
          const amountSpent = getAmountSpent(budget.categoryKey, budget.date);
          const remainingBalance = budgetLimit - amountSpent;
          const progressBarPercentage = (amountSpent / budgetLimit) * 100;
          const progressBarBackground = getProgressBackground(
            progressBarPercentage,
            budget.type
          );

          return (
            <div
              key={budget.id}
              className="bg-[rgb(var(--color-bg-card))] h-50 p-4 rounded-lg flex justify-between items-start gap-4"
            >
              <div className="flex flex-col grow h-full space-y-1.5">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">
                    {budget.category.toLowerCase() === "other"
                      ? budget.name
                      : budget.category}
                  </h3>
                  <p className="text-gray-500 bg-[rgb(var(--color-bg))] text-sm font-medium w-fit py-0.5 px-2 rounded mt-1">
                    {monthLabel}
                  </p>
                </div>

                {/* Budget summary */}
                <div className="grow w-full">
                  <p className="text-base font-medium">
                    Limit:{" "}
                    <strong className="text-[rgb(var(--color-muted))]">
                      {formattedAmount(budgetLimit)}
                    </strong>
                  </p>
                  {budget.type === "expense" && (
                    <p className="text-base font-medium">
                      Spent:{" "}
                      <strong className="text-[rgb(var(--color-muted))]">
                        {formattedAmount(amountSpent)}
                      </strong>
                    </p>
                  )}
                  <p className="text-base font-medium">
                    {progressBarPercentage > 100 && budget.type === "expense"
                      ? "Overspent"
                      : progressBarPercentage > 100 && budget.type === "income"
                      ? "Extra"
                      : "Remaining"}
                    :{" "}
                    <strong className="text-[rgb(var(--color-muted))]">
                      {progressBarPercentage > 100
                        ? Math.abs(formattedAmount(remainingBalance))
                        : formattedAmount(remainingBalance)}
                    </strong>
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-[rgb(var(--color-gray-border))] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressBarBackground} rounded-full transition-all duration-500 ease-in-out`}
                    style={{
                      width: `${progressBarPercentage}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="text-sm text-blue-500 hover:text-blue-600 transition cursor-pointer"
                  onClick={() => handleEditBudget(budget.id)}
                >
                  <HiOutlinePencil className="text-lg" />
                </button>
                <button
                  onClick={() => handleDeleteTransaction(budget.id)}
                  className="text-sm text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                  <HiOutlineTrash className="text-lg" />
                </button>
              </div>
            </div>
          );
        })}

        {/* End of Budgets */}
      </div>

      {/* Empty state if budget searched does not exist */}
      {filteredBudgets?.length === 0 && budgets.length > 0 && (
        <p className="text-center text-base text-[rgb(var(--color-muted))] mb-6">
          The budget you are looking for does not exist.
        </p>
      )}

      {/* Empty State */}
      {budgets.length === 0 && (
        <>
          <p className="mt-6 text-base text-center text-[rgb(var(--color-muted))] mb-6">
            You have not added any budgets yet.
          </p>

          <button
            onClick={() => onOpenModal("budgets", "add")}
            className="bg-blue-500 hover:bg-blue-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-base font-semibold flex items-center mx-auto gap-2"
          >
            <HiOutlinePlus />
            <span>
              {budgets.length === 0 ? "Add Your First Budget" : "Add Budget"}
            </span>
          </button>
        </>
      )}
    </main>
  );
};

export default Budgets;
