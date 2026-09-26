import getExpenseBudgetDetails from "./getExpenseBudgetDetails";
import { formatAmount } from "../../utils/formatAmount";
import clsx from "clsx";

export default function ExpenseBudgetRow({
  budget,
  currency,
  warningThreshold,
}) {
  const { category, spent, limit, period, progress, remainingLabel, tone } =
    getExpenseBudgetDetails(budget, warningThreshold, currency);

  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="min-w-0 break-words text-sm font-medium">
          {category}
        </span>
        <span className="min-w-0 break-words text-xs tabular-nums text-muted-foreground">
          {formatAmount(spent, currency)} /{" "}
          {formatAmount(Number.isFinite(limit) ? limit : 0, currency)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${category}, ${period}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={`${formatAmount(spent, currency)} spent. ${remainingLabel}.`}
        className="h-2 w-full overflow-hidden rounded-full bg-border [&>span]:block [&>span]:h-full [&>span]:rounded-[inherit] [&>span]:bg-[var(--sb-accent)] mt-2"
      >
        <div
          className={clsx("h-full rounded-[inherit]", {
            "bg-success": tone === "success",
            "bg-warning": tone === "warning",
            "bg-danger": tone === "danger",
            "bg-muted-foreground": tone === "neutral",
          })}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{period}</span>
        <span className="min-w-0 break-words tabular-nums">
          {remainingLabel}
        </span>
      </div>
    </li>
  );
}
