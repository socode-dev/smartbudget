import clsx from "clsx";
import { FiArrowUpRight, FiArrowDownRight, FiCreditCard } from "react-icons/fi";
import { LuScale } from "react-icons/lu";
import { useOverviewContext } from "../../context/OverviewContext";
import useCurrencyStore from "../../store/useCurrencyStore";
import { formatAmount } from "../../utils/formatAmount";

const SummaryCards = () => {
  const currency = useCurrencyStore((state) => state.selectedCurrency);
  const {
    totalIncome,
    totalExpenses,
    netBalance,
    totalBudget,
    budgetUsagePercentage,
    totalBudgetUsed,
    incomeLabel,
    expensesLabel,
  } = useOverviewContext();

  const usage = Number.isFinite(budgetUsagePercentage) ? Math.max(0, budgetUsagePercentage) : 0;

  let netCaption;
  switch (true) {
    case netBalance === 0:
      netCaption = "You are breaking even";
      break;
    case netBalance > 0:
      netCaption = "You are in the green";
      break;
    case totalIncome === 0:
      netCaption = "No income recorded";
      break;
    default:
      netCaption = "You are in the red";
  }

  const cards = [
    {
      id: "total-income",
      label: "Total Income",
      value: formatAmount(totalIncome, currency),
      caption: incomeLabel,
      tone: "success",
      icon: FiArrowUpRight,
    },
    {
      id: "total-expenses",
      label: "Total Expenses",
      value: formatAmount(totalExpenses, currency),
      caption: expensesLabel,
      tone: "danger",
      icon: FiArrowDownRight,
    },
    {
      id: "net-balance",
      label: "Net Balance",
      value: formatAmount(netBalance, currency),
      caption: netCaption,
      tone: netBalance < 0 ? "danger" : "success",
      icon: LuScale,
    },
    {
      id: "budget-usage",
      label: "Budget Usage",
      value: `${usage}% used`,
      caption: `${formatAmount(totalBudgetUsed, currency)} of ${formatAmount(totalBudget, currency)}`,
      tone: usage > 100 ? "danger" : "warning",
      icon: FiCreditCard,
    },
  ];
  
  return cards.map(({ id, label, value, caption, tone, icon: Icon }) => (
    <article
      key={id}
      id={id}
      className={clsx(
        "relative min-w-0 overflow-hidden rounded-xl border border-border border-t-2 border-t-[var(--sb-accent)] bg-card p-5",
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase text-muted-foreground">
          {label}
        </h2>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sb-soft)] text-[var(--sb-accent)]">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p
        className={clsx(
          "mt-5 font-display leading-tight font-semibold text-[var(--sb-accent)] tabular-nums wrap-anywhere",
          value.length > 18
            ? "text-lg"
            : value.length > 14
              ? "text-[22px]"
              : "text-[28px]",
        )}
      >
        {value}
      </p>
      <p className="mt-3 break-words text-xs leading-relaxed text-muted-foreground">
        {caption}
      </p>
    </article>
  ));
};
export default SummaryCards;
