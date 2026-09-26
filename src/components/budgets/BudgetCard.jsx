import getBudgetCardDetails from "./getBudgetCardDetails";
import BudgetCardHeader from "./BudgetCardHeader";
import clsx from "clsx";
import { formatAmount } from "../../utils/formatAmount";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

export default function BudgetCard({
  budget,
  handleEditBudget,
  deletingId,
  deleteBudget,
  selectedCurrency,
  warningThreshold,
}) {
  const {
    tone,
    name,
    income,
    date,
    validLimit,
    limit,
    progress,
    percent,
    status,
    over,
  } = getBudgetCardDetails(budget, warningThreshold);

  return (
    <article
      className={clsx(
        "flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-card p-5",
        {
          "[--sb-accent:var(--primary)] [--sb-soft:var(--info-soft)]":
            tone === "primary",
          "[--sb-accent:var(--success)] [--sb-soft:var(--success-soft)]":
            tone === "success",
          "[--sb-accent:var(--danger)] [--sb-soft:var(--danger-soft)]":
            tone === "danger",
          "[--sb-accent:var(--warning)] [--sb-soft:var(--warning-soft)]":
            tone === "warning",
        },
      )}
    >
      <BudgetCardHeader
        name={name}
        income={income}
        date={date}
        handleEditBudget={handleEditBudget}
        budget={budget}
        deletingId={deletingId}
        deleteBudget={deleteBudget}
      />
      {budget.description && (
        <p className="break-words text-xs leading-relaxed text-muted-foreground">
          {budget.description}
        </p>
      )}
      <div>
        <p className="font-display text-2xl font-semibold tabular-nums wrap-anywhere">
          {formatAmount(budget.activity, selectedCurrency)}
        </p>
        <p className="mt-1 break-words text-xs text-muted-foreground">
          {income ? "received" : "spent"} of{" "}
          {formatAmount(validLimit ? limit : 0, selectedCurrency)}{" "}
          {income ? "target" : "limit"}
        </p>
      </div>
      <div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-border [&>span]:block [&>span]:h-full [&>span]:rounded-[inherit] [&>span]:bg-[var(--sb-accent)]"
          role="progressbar"
          aria-label={`${name} ${income ? "income" : "spending"} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={
            validLimit
              ? `${percent.toFixed(0)}% ${income ? "received" : "used"}`
              : "No valid limit"
          }
        >
          <span
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {validLimit
            ? `${percent.toFixed(0)}% ${income ? "received" : "used"}`
            : "N/A"}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span
          className={clsx(
            "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-[var(--sb-soft)] px-2.5 py-1 text-xs",
            "leading-4 font-medium text-[var(--sb-accent)] wrap-anywhere [&>svg]:shrink-0",
          )}
        >
          {tone === "danger" || tone === "warning" ? (
            <FiAlertTriangle aria-hidden="true" />
          ) : tone === "success" ? (
            <FiCheckCircle aria-hidden="true" />
          ) : null}
          {status}
        </span>
        {validLimit && (
          <p className="min-w-0 text-sm font-medium text-[var(--sb-accent)] tabular-nums wrap-anywhere">
            {formatAmount(Math.abs(limit - budget.activity), selectedCurrency)}{" "}
            {over ? (income ? "extra" : "over") : income ? "to go" : "left"}
          </p>
        )}
      </div>
    </article>
  );
}
