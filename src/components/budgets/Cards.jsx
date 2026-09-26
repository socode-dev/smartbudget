import BudgetCard from "./BudgetCard";
import clsx from "clsx";
import { useState } from "react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { useBudgetsContext } from "../../context/BudgetsContext";
import useCurrencyStore from "../../store/useCurrencyStore";
import useTransactionStore from "../../store/useTransactionStore";
import useThresholdStore from "../../store/useThresholdStore";
import { getAmountSpent } from "../../utils/getAmountSpent";
import Pagination from "../ui/Pagination";

const Cards = () => {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const transactions = useTransactionStore((state) => state.transactions);
  const warningThreshold = useThresholdStore(state => state.thresholds?.budgetThreshold80 ?? 80);

  const { filteredBudgets, handleEditBudget, handleDeleteBudget } = useBudgetsContext();

    const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const pages = Math.max(1, Math.ceil(filteredBudgets.length / 6));
  const currentPage = Math.min(page, pages);

  const rows = filteredBudgets.map((budget) => ({
    ...budget,
    activity: getAmountSpent(
      budget.categoryKey,
      budget.date,
      budget.type,
      transactions,
    ),
  }));

  const overCount = rows.filter(
    (budget) =>
      budget.type === "expense" && budget.activity > Number(budget.amount),
  ).length;

  const deleteBudget = async (id) => {
    if (deletingId) return;
    setDeletingId(id);

    try {
      await handleDeleteBudget(id);
    } catch {
      toast.error("Could not delete the budget. Please refresh and try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3 border-y border-border py-4">
        <span
          className={clsx(
            "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-[var(--sb-soft)] px-2.5 py-1 text-xs leading-4 font-medium text-[var(--sb-accent)] wrap-anywhere [&>svg]:shrink-0",
            {
              "[--sb-accent:var(--success)] [--sb-soft:var(--success-soft)]":
                !overCount,
              "[--sb-accent:var(--danger)] [--sb-soft:var(--danger-soft)]":
                !!overCount,
            },
          )}
        >
          {overCount ? (
            <FiAlertTriangle aria-hidden="true" />
          ) : (
            <FiCheckCircle aria-hidden="true" />
          )}
          {overCount} expense {overCount === 1 ? "budget" : "budgets"} over
          limit
        </span>
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "budget" : "budgets"} matching your
          search
        </p>
      </div>
      <section
        id="budget-cards"
        aria-label="Category budgets"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 min-[1280px]:grid-cols-3"
      >
        {rows.slice((currentPage - 1) * 6, currentPage * 6).map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            handleEditBudget={handleEditBudget}
            deletingId={deletingId}
            deleteBudget={deleteBudget}
            selectedCurrency={selectedCurrency}
            warningThreshold={warningThreshold}
          />
        ))}
      </section>
      <Pagination
        page={currentPage}
        pages={pages}
        onPageChange={setPage}
        label="Budgets pagination"
        count={`${rows.length} budgets`}
      />
    </div>
  );
};
export default Cards;
