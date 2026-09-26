import clsx from "clsx";
import { formatAmount } from "../../utils/formatAmount";

export default function TransactionSummary({ summary, selectedCurrency }) {
  return (
    <dl
      id="transactions-summary"
      aria-label="Totals for matching transactions"
      className={clsx(
        "grid grid-cols-1 border-y border-border min-[420px]:grid-cols-2 md:grid-cols-4 [&>div]:min-w-0 [&>div]:p-4 [&_dt]:text-xs",
        "[&_dt]:font-medium [&_dt]:text-muted-foreground [&_dd]:mt-1.5 [&_dd]:font-display [&_dd]:text-lg [&_dd]:font-semibold",
        "[&_dd]:text-[var(--sb-accent)] [&_dd]:tabular-nums [&_dd]:wrap-anywhere",
      )}
    >
      {summary.map(({ label, value, tone }) => (
        <div
          key={label}
          className={clsx({
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
          <dt>{label}</dt>
          <dd>{formatAmount(value, selectedCurrency)}</dd>
        </div>
      ))}
    </dl>
  );
}
