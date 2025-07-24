import { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineTrash, HiOutlinePencil, HiOutlinePlus } from "react-icons/hi";
import { useModalContext } from "../context/ModalContext";
import useTransactionStore from "../store/useTransactionStore";
import { useFormContext } from "../context/FormContext";

const Budgets = () => {
  const [searchName, setSearchName] = useState("");
  const { onOpenModal } = useModalContext();
  const { budgets, transactions, deleteTransaction, setEditTransaction } =
    useTransactionStore();
  const forms = useFormContext("budgets");
  const { setValue } = forms;

  const filteredBudgets = budgets.filter((budget) => {
    const matchesName =
      searchName === ""
        ? true
        : budget?.name?.toLowerCase().includes(searchName?.toLowerCase());

    return matchesName;
  });

  const handleEditTransaction = (id, label) => {
    const budget = budgets.find((tx) => tx.id === id);
    if (!budget && !label) return;

    setValue("name", budget.name);
    setValue("category", budget.category);
    setValue("type", budget.type);
    setValue("amount", budget.amount.toFixed(2));
    setValue("date", budget.date);
    setValue("description", budget.description);

    onOpenModal(label, "edit");
    setEditTransaction(budget);
  };

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id, "budgets");
  };

  const getAmountSpent = useCallback(
    (key) => {
      const amountSpent = transactions.filter((tx) => tx.categoryKey === key);
      return amountSpent.reduce((acc, tx) => acc + tx.amount, 0);
    },
    [transactions]
  );

  return (
    <main className="p-8">
      <h2 className="text-2xl font-semibold mb-2">Budgets</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mb-3">
        Monitor and manage your category limits
      </p>

      {budgets.length > 0 && (
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full mx-auto mb-6 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Groceries Category */}

        {filteredBudgets.map((budget) => {
          const budgetLimit = budget.amount.toFixed(2);
          const amountSpent = getAmountSpent(budget.categoryKey).toFixed(2);
          const remainingBalance = (budgetLimit - amountSpent).toFixed(2);
          const progressBarPercentage = (amountSpent / budgetLimit) * 100;
          const progressBarBackground =
            progressBarPercentage < 100 && progressBarPercentage >= 70
              ? "bg-amber-500"
              : progressBarPercentage < 70
              ? "bg-[rgb(var(--color-brand))]"
              : "bg-red-500";

          return (
            <div
              key={budget.id}
              className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg flex justify-between items-start gap-4"
            >
              <div className="flex flex-col gap-2 grow">
                <h3 className="text-lg font-semibold">
                  {budget.category.toLowerCase() === "other"
                    ? budget.name
                    : budget.category}
                </h3>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Limit:{" "}
                  <strong>
                    {budget.currencySymbol}
                    {budgetLimit}
                  </strong>
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Spent:{" "}
                  <strong>
                    {budget.currencySymbol}
                    {amountSpent}
                  </strong>
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Remaining:{" "}
                  <strong>
                    {budget.currencySymbol}
                    {remainingBalance}
                  </strong>
                </p>

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
                  onClick={() => handleEditTransaction(budget.id, "budgets")}
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
        <p className="mt-6 text-base text-[rgb(var(--color-muted))] mb-6">
          You have not added any budgets yet.
        </p>
      )}

      <button
        onClick={() => onOpenModal("budgets", "add")}
        className={`mt-10 ${
          !filteredBudgets?.length && "mx-auto"
        } bg-blue-500 hover:bg-blue-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2`}
      >
        <HiOutlinePlus />
        <span>
          {budgets.length === 0 ? "Add Your First Budget" : "Add Budget"}
        </span>
      </button>
    </main>
  );
};

export default Budgets;
