import clsx from "clsx";
import { titleCase, insightTypeLabel } from "./insightPresentation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { FiX } from "react-icons/fi";

export default function InsightHistoryFilters({
  filters,
  update,
  options,
  hasFilters,
  reset,
}) {

  return (
    <div
      className={clsx(
        "rounded-lg border border-border bg-card p-4 [&_label]:text-xs [&_label]:font-normal [&_label]:text-muted-foreground",
        "[&_input]:h-9 [&_input]:py-1.5 [&_select]:h-9 [&_select]:py-1.5",
      )}
    >
      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 min-[1100px]:grid-cols-5 [&>div]:min-w-0">
        {["type", "category", "severity", "status"].map((field) => (
          <div key={field}>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor={`history-${field}`}
            >
              {titleCase(field)}
            </label>
            <select
              id={`history-${field}`}
              className={clsx(
                "block h-11 min-w-0 w-full rounded-md border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground",
                "shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary",
                "focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-danger disabled:cursor-not-allowed",
                "disabled:opacity-65 motion-reduce:transition-none md:text-sm",
              )}
              value={filters[field]}
              onChange={update(field)}
            >
              <option value="all">
                All{" "}
                {field === "category"
                  ? "categories"
                  : field === "status"
                    ? "statuses"
                    : field === "severity"
                      ? "severities"
                      : "types"}
              </option>
              {options[field].map((value) => (
                <option key={value} value={value}>
                  {field === "type"
                    ? insightTypeLabel(value)
                    : field === "category"
                      ? value
                      : titleCase(value)}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium"
            htmlFor="history-expiry"
          >
            Expiring before
          </label>
          <Input
            id="history-expiry"
            type="date"
            value={filters.expiry}
            onChange={update("expiry")}
          />
        </div>
      </div>
      {hasFilters && (
        <Button variant="ghost" onClick={reset} className="mt-2">
          <span className="flex items-center gap-2">
            <FiX aria-hidden="true" />
            Clear filters
          </span>
        </Button>
      )}
    </div>
  );
}
