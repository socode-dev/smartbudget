import { format } from "date-fns";
import { formatAmount } from "../../utils/formatAmount";

export default function getExpenseBudgetDetails(
  budget,
  warningThreshold,
  currency,
) {
  const limit = Number(budget.amount);
  const hasLimit = Number.isFinite(limit) && limit > 0;
  const spent = Number.isFinite(Number(budget.spent)) ? Number(budget.spent) : 0;
  const percentage = hasLimit ? (spent / limit) * 100 : 0;
  const progress = Math.max(0, Math.min(100, percentage));
  const remaining = limit - spent;
  const overLimit = hasLimit && spent > limit;

  let tone;
  switch (true) {
    case !hasLimit:
      tone = "neutral";
      break;
    case overLimit:
      tone = "danger";
      break;
    case percentage >= warningThreshold || percentage >= 100:
      tone = "warning";
      break;
    default:
      tone = "success";
  }

        const category =
    budget.category?.toLowerCase() === "other"
      ? budget.name || budget.category
      : budget.category || budget.name || "Budget";

  const date = new Date(budget.date);
  
  const period = Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "MMM yyyy");

  let remainingLabel;
  switch (true) {
    case !hasLimit:
      remainingLabel = "No positive limit set";
      break;
    case overLimit:
      remainingLabel = `${formatAmount(Math.abs(remaining), currency)} over limit`;
      break;
    case remaining === 0:
      remainingLabel = "Limit reached";
      break;
    default:
      remainingLabel = `${formatAmount(remaining, currency)} remaining`;
  }
  return {
    category,
    spent,
    limit,
    period,
    progress,
    remainingLabel,
    tone,
  };
}
