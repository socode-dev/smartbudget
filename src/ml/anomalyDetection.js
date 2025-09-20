import { parseISO, format } from "date-fns";

// Detect unusual monthly spend by category
export const detectAnomalies = (transactions) => {
  const byCategoryMonth = {};

  transactions?.forEach((transaction) => {
    // Use a sortable month key and friendly label
    const month = format(parseISO(transaction.date), "yyyy, MMM");
    const key = `${transaction.category}__${month}`;
    byCategoryMonth[key] = (byCategoryMonth[key] || 0) + transaction.amount;
  });

  const categorySeries = {};
  Object.entries(byCategoryMonth)?.forEach(([key, total]) => {
    const [category, month] = key.split("__");
    if (!categorySeries[category]) categorySeries[category] = [];
    categorySeries[category].push({ month, total });
  });

  const insights = [];

  Object.entries(categorySeries)?.forEach(([category, series]) => {
    series.sort((a, b) => a.month.localeCompare(b.month));
    const values = series.map((s) => s.total);
    if (values.length < 4) return;

    const median = getMedian(values);
    const mad = getMAD(values, median) || 1e-6;

    series.forEach(({ month, total }) => {
      const robustZ = Math.abs((total - median) / (1.4826 * mad));
      const percentageMore = ((total - median) / median) * 100;

      if (robustZ >= 5) {
        insights.push({
          id: `tmp_${Math.random().toString(36).slice(2)}`,
          type: "anomaly",
          message: `You've spent ${Math.ceil(
            percentageMore
          )}% more on "${category}" in ${month} compared to your norm.`,
          category,
          actionType: "suggestion",
          actionText: `Set a spending limit on "${category}"`,
          createdAt: new Date(),
          severity: "high",
          source: "ml",
          confidence: 0.8,
        });
      } else if (robustZ >= 3) {
        insights.push({
          id: `tmp_${Math.random().toString(36).slice(2)}`,
          type: "anomaly",
          message: `You've spent ${Math.ceil(
            percentageMore
          )}% more on "${category}" in ${month} compared to your norm.`,
          category,
          actionType: "suggestion",
          actionText: `Set a spending limit on "${category}"`,
          createdAt: new Date(),
          severity: "medium",
          source: "ml",
          confidence: 0.8,
        });
      }
    });
  });

  return insights;
};

const getMedian = (arr) => {
  const sorted = [...arr]?.sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const getMAD = (arr, median) => {
  const dev = arr?.map((value) => Math.abs(value - median));
  return getMedian(dev);
};
