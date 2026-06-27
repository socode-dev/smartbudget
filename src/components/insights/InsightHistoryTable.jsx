import { useMemo, useState } from "react";
import clsx from "clsx";
import ResponsiveTable from "../ui/ResponsiveTable";

const typeLabels = {
  anomaly: "Anomaly",
  budget: "Budget",
  cashflow: "Cash Flow",
  risk: "Risk",
};

const filterOptions = {
  type: ["all", "risk", "anomaly", "budget", "cashflow"],
  status: ["all", "ACTIVE", "EXPIRED"],
};

const InsightHistoryTable = ({ histories = [] }) => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredHistories = useMemo(() => {
    return histories
      .filter((history) => typeFilter === "all" || history.type === typeFilter)
      .filter((history) => statusFilter === "all" || history.status === statusFilter)
      .sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt));
  }, [histories, typeFilter, statusFilter]);

  const columns = [
    {
      key: "createdAt",
      header: "Date",
      render: (history) => formatDate(history.createdAt),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "type",
      header: "Type",
      render: (history) => typeLabels[history.type] || toTitleCase(history.type),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "category",
      header: "Category",
      render: (history) => history.category || "N/A",
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "severity",
      header: "Severity",
      render: (history) => (
        <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", severityClass(history.severity))}>
          {history.severity}
        </span>
      ),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "status",
      header: "Status",
      render: (history) => (
        <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", statusClass(history.status))}>
          {toTitleCase(history.status)}
        </span>
      ),
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "expiresAt",
      header: "Expires",
      render: (history) => formatDate(history.expiresAt),
      cellClassName: "whitespace-nowrap",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Insight History</h3>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Active and expired insight records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-md border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] px-3 py-2 text-sm outline-none"
          >
            {filterOptions.type.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All types" : typeLabels[type]}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] px-3 py-2 text-sm outline-none"
          >
            {filterOptions.status.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : toTitleCase(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveTable
        columns={columns}
        rows={filteredHistories}
        getRowKey={(history) => history.id}
        emptyMessage="No insight history matches the selected filters."
        mobileRow={(history) => (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold">
                  {typeLabels[history.type] || toTitleCase(history.type)}
                </p>
                <p className="mt-1 text-sm text-[rgb(var(--color-muted))]">
                  {history.category || "N/A"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {columns[3].render(history)}
                {columns[4].render(history)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[rgb(var(--color-muted))]">Date</p>
                <p className="mt-1 font-medium">{formatDate(history.createdAt)}</p>
              </div>
              <div>
                <p className="text-[rgb(var(--color-muted))]">Expires</p>
                <p className="mt-1 font-medium">{formatDate(history.expiresAt)}</p>
              </div>
            </div>
          </div>
        )}
      />
    </section>
  );
};

const severityClass = (severity) => {
  if (severity === "HIGH") return "bg-red-100 text-red-600";
  if (severity === "MEDIUM") return "bg-amber-100 text-amber-600";

  return "bg-blue-100 text-blue-600";
};

const statusClass = (status) => {
  return status === "ACTIVE"
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-600";
};

const toDate = (value) => {
  if (!value) return new Date(0);
  if (typeof value?.toDate === "function") return value.toDate();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

const formatDate = (value) => {
  const date = toDate(value);
  if (date.getTime() === 0) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const toTitleCase = (value = "") => {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default InsightHistoryTable;
