import { FiSearch, FiFileText, FiPlus } from "react-icons/fi";
import Button from "../ui/Button";

export default function TransactionEmptyState({
  hasTransactions,
  resetFilters,
  addTransaction,
}) {
  return (
    <section
      id={
        hasTransactions ? "transactions-no-results" : "transactions-empty-state"
      }
      className="flex min-h-80 flex-col items-center justify-center gap-4 px-4 py-8 text-center"
      aria-labelledby="transactions-empty-heading"
    >
      <span
        className="grid size-12 place-items-center rounded-lg bg-info-soft text-2xl text-primary"
        aria-hidden="true"
      >
        {hasTransactions ? <FiSearch /> : <FiFileText />}
      </span>
      <h2
        id="transactions-empty-heading"
        className="font-display text-xl font-semibold"
      >
        {hasTransactions ? "No matching transactions" : "No transactions yet"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {hasTransactions
          ? "No transactions match your current filters."
          : "Start by adding your first income or expense."}
      </p>
      {hasTransactions ? (
        <Button variant="outline" onClick={resetFilters}>
          Clear filters
        </Button>
      ) : (
        <Button
          id="add-first-transaction-btn"
          onClick={addTransaction}
          aria-haspopup="dialog"
        >
          <span className="flex items-center gap-2">
            <FiPlus aria-hidden="true" />
            Add first transaction
          </span>
        </Button>
      )}
    </section>
  );
}
