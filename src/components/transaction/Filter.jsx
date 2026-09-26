import TransactionSearch from "./TransactionSearch";
import clsx from "clsx";
import { FiX } from "react-icons/fi";
import { useTransactionsContext } from "../../context/TransactionsContext";
import useTransactionStore from "../../store/useTransactionStore";
import Input from "../ui/Input";
import Button from "../ui/Button";

const Filter = () => {
  const { filters, setFilters, resetFilters } = useTransactionsContext();
  const categories = useTransactionStore((state) => state.categories);
  const transactions = useTransactionStore((state) => state.transactions);

  const availableCategories = [
    ...new Set(
      [
        ...categories,
        ...transactions.map((transaction) => transaction.category),
      ].filter(Boolean),
    ),
  ];

  const hasFilters =
    filters.search ||
    filters.fromDate ||
    filters.toDate ||
    filters.category !== "all" ||
    filters.type !== "all";

  const update = (field) => (event) => {
    const value = event.target.value;
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="border border-border rounded-lg p-5">
      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 min-[1280px]:grid-cols-[minmax(0,1.75fr)_repeat(4,minmax(0,1fr))] [&>div]:min-w-0">
        <TransactionSearch filters={filters} update={update} />

        <div
          className={clsx(
            "col-span-full sm:col-auto [&_input]:box-border [&_input]:min-w-0 [&_input]:w-full [&_input]:max-w-full",
            "[&_input]:appearance-none [&_input::-webkit-date-and-time-value]:min-w-0 [&_input::-webkit-date-and-time-value]:text-left",
            "[&_input::-webkit-datetime-edit]:min-w-0 [&_input::-webkit-datetime-edit]:p-0!",
          )}
        >
          <label
            htmlFor="transaction-from"
            className="mb-1.5 block text-sm font-medium"
          >
            From
          </label>
          <Input
            id="transaction-from"
            type="date"
            value={filters.fromDate}
            max={filters.toDate || undefined}
            onChange={update("fromDate")}
          />
        </div>

        <div
          className={clsx(
            "col-span-full sm:col-auto [&_input]:box-border [&_input]:min-w-0 [&_input]:w-full [&_input]:max-w-full",
            "[&_input]:appearance-none [&_input::-webkit-date-and-time-value]:min-w-0 [&_input::-webkit-date-and-time-value]:text-left",
            "[&_input::-webkit-datetime-edit]:min-w-0 [&_input::-webkit-datetime-edit]:p-0!",
          )}
        >
          <label
            htmlFor="transaction-to"
            className="mb-1.5 block text-sm font-medium"
          >
            To
          </label>
          <Input
            id="transaction-to"
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={update("toDate")}
          />
        </div>

        <div>
          <label
            htmlFor="transaction-category"
            className="mb-1.5 block text-sm font-medium"
          >
            Category
          </label>
          <select
            id="transaction-category"
            className={clsx(
              "block h-11 min-w-0 w-full rounded-md border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground",
              "shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary",
              "focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-danger disabled:cursor-not-allowed",
              "disabled:opacity-65 motion-reduce:transition-none md:text-sm",
            )}
            value={filters.category}
            onChange={update("category")}
          >
            <option value="all">All categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="transaction-type"
            className="mb-1.5 block text-sm font-medium"
          >
            Type
          </label>
          <select
            id="transaction-type"
            className={clsx(
              "block h-11 min-w-0 w-full rounded-md border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground",
              "shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary",
              "focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-danger disabled:cursor-not-allowed",
              "disabled:opacity-65 motion-reduce:transition-none md:text-sm",
            )}
            value={filters.type}
            onChange={update("type")}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
      {hasFilters && (
        <Button variant="ghost" onClick={resetFilters} className="mt-2">
          <span className="flex items-center gap-2">
            <FiX aria-hidden="true" />
            Clear filters
          </span>
        </Button>
      )}
    </div>
  );
};
export default Filter;
