import useTransactionStore from "../../store/useTransactionStore";
import { useTransactionsContext } from "../../context/TransactionsContext";

const Filter = () => {
  const { CATEGORY_OPTIONS } = useTransactionStore();
  const { filters, setFilters } = useTransactionsContext();

  return (
    <div className="grid grid-cols-8 items-center gap-3 md:gap-5 mb-6">
      {/* Search by Note */}
      <input
        type="text"
        placeholder="Search by description..."
        className="col-span-full sm:col-span-4 md:col-span-full xl:col-span-3 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-sm p-2"
        value={filters.search}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, search: e.target.value }))
        }
      />

      {/* Date Range */}
      <div className="w-full col-span-full sm:col-span-4 md:col-span-4 xl:col-span-3 flex gap-2">
        {/* From Date */}
        <div className="w-1/2 flex items-center gap-2">
          <label className="text-sm text-[rgb(var(--color-muted))]">From</label>
          <input
            type="date"
            className="w-full rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
            }
          />
        </div>

        {/* To Date */}
        <div className="w-1/2 flex items-center gap-2">
          <label className="text-sm text-[rgb(var(--color-muted))]">To</label>
          <input
            type="date"
            className="w-full rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, toDate: e.target.value }))
            }
          />
        </div>
      </div>
      {/* Category Filter */}
      <select
        className="col-span-4 md:col-span-2 xl:col-span-1 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-sm p-2 cursor-pointer"
        value={filters.category}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, category: e.target.value }))
        }
      >
        <option value="all">All Categories</option>
        {CATEGORY_OPTIONS.map((opt, i) => (
          <option key={i} value={opt.name}>
            {opt.name}
          </option>
        ))}
      </select>

      {/* Type Filter */}
      <select
        className="col-span-4 md:col-span-2 xl:col-span-1 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-sm p-2 cursor-pointer"
        value={filters.type}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, type: e.target.value }))
        }
      >
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>
  );
};

export default Filter;
