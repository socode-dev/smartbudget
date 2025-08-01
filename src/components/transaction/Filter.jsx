import useTransactionStore from "../../store/useTransactionStore";

const Filter = ({
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
}) => {
  const { CATEGORY_OPTIONS } = useTransactionStore();

  return (
    <div className="grid grid-cols-2 items-center gap-3 md:gap-5 mb-6">
      {/* Search by Note */}
      <input
        type="text"
        placeholder="Search by description..."
        className="col-span-full md:col-span-1 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2"
        value={searchDescription}
        onChange={(e) => setSearchDescription(e.target.value)}
      />

      {/* Date Range */}
      <div className="flex gap-2 col-span-full md:col-span-1">
        {/* From Date */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-[rgb(var(--color-muted))]">From</label>
          <input
            type="date"
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        {/* To Date */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-[rgb(var(--color-muted))]">To</label>
          <input
            type="date"
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>
      {/* Category Filter */}
      <select
        className="col-span-full md:col-span-1 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2 cursor-pointer"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
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
        className="col-span-full md:col-span-1 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-xs p-2 cursor-pointer"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>
  );
};

export default Filter;
