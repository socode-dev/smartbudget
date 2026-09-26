import clsx from "clsx";
import useCurrencyStore from "../../store/useCurrencyStore";
import { formatAmount } from "../../utils/formatAmount";

const BudgetSummary = ({
  title,
  total,
  percentage,
  remaining,
  hasBudget,
  status,
  tone,
  type,
}) => {
  const currency = useCurrencyStore((state) => state.selectedCurrency);
  const progress = Math.max(0, Math.min(100, percentage));
  const label = hasBudget ? `${Math.ceil(percentage)}%` : "N/A";
  const balanceLabel = remaining < 0 ? (type === "income" ? "Extra" : "Overspent") : "Remaining";
  
    return (
    <article
      className={clsx("rounded-lg border border-border bg-card p-4", {
        "[--sb-accent:var(--primary)] [--sb-soft:var(--info-soft)]":
          tone === "primary",
        "[--sb-accent:var(--success)] [--sb-soft:var(--success-soft)]":
          tone === "success",
        "[--sb-accent:var(--danger)] [--sb-soft:var(--danger-soft)]":
          tone === "danger",
        "[--sb-accent:var(--warning)] [--sb-soft:var(--warning-soft)]":
          tone === "warning",
      })}
    >
      <div className="flex items-center gap-4">
        <div
          className={clsx(
            "grid size-18 shrink-0 place-items-center rounded-full",
            "bg-[conic-gradient(var(--sb-accent)_var(--progress),var(--border)_0)] [&>span]:flex [&>span]:size-14",
            "[&>span]:items-center [&>span]:justify-center [&>span]:rounded-full [&>span]:bg-card [&>span]:font-display",
            "[&>span]:font-semibold [&>span]:tabular-nums",
          )}
          role="img"
          aria-label={`${title}: ${label}`}
          style={{
            "--progress": `${progress}%`,
          }}
        >
          <span className={clsx(label.length > 5 ? "text-xs" : "text-base")}>
            {label}
          </span>
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="break-words text-xs leading-relaxed tabular-nums text-muted-foreground">
            {hasBudget
              ? `${label} of ${formatAmount(total, currency)} ${type === "income" ? "goal reached" : "limit used"}`
              : `No ${type} budget yet`}
          </p>
          {hasBudget && (
            <p className="break-words text-xs tabular-nums text-muted-foreground">
              {balanceLabel}: {formatAmount(Math.abs(remaining), currency)}
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Status:{" "}
        <span className="rounded-full bg-[var(--sb-soft)] px-2.5 py-1 font-medium text-[var(--sb-accent)]">
          {status}
        </span>
      </p>
    </article>
  );
};

export default BudgetSummary;
