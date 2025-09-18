import { parseISO, format } from "date-fns";

// Convert raw transactions into monthly aggregated totals per category
export const preprocessTransaction = (transactions) => {
  // Accumulator for category-month totals keyed by `${category}-${month}`
  const categoryTotals = {};

  // Aggregate each transaction into its category/month bucket
  transactions?.forEach((transaction) => {
    // month string like '2025-09'
    const month = format(parseISO(transaction.date), "yyyy-MM");
    const key = `${transaction.category}-${month}`;

    // Initialize bucket if missing
    if (!categoryTotals[key]) {
      categoryTotals[key] = {
        category: transaction.category,
        month,
        total: 0,
      };
    }
    // Accumulate amounts
    categoryTotals[key].total += transaction.amount;
  });

  // Convert accumulator into grouped arrays per category
  const grouped = {};
  Object.values(categoryTotals).forEach(({ category, month, total }) => {
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ month, total });
  });

  // Ensure each category series is sorted by month ascending
  Object.keys(grouped).forEach((category) => {
    grouped[category] = grouped[category].sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  });

  // Return grouped monthly totals per category
  return grouped;
};
