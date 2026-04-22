import { parseISO, format } from "date-fns";
import { getMedian, getMAD, getRiskScore } from "../../utils/stats";

// Detect unusual monthly spend by category
export const detectAnomalies = (transactions) => {
  const MIN_HISTORY_MONTHS = 4;
  const ROBUST_Z_THRESHOLD = 3;
  const MIN_ABSOLUTE_INCREASE = 50;
  const MIN_PERCENT_INCREASE = 25;

  const byCategoryMonth = {};

  transactions?.forEach((transaction) => {
    if (!transaction.date || !transaction.category || typeof transaction.amount !== 'number') {
      return;
    }
    const date = parseISO(transaction.date);
    if (isNaN(date.getTime())) {
      return;
    }
    const monthKey = format(date, "yyyy-MM");
    const monthLabel = format(date, "yyyy, MMM");
    const key = `${transaction.category}__${monthKey}`;

    if (!byCategoryMonth[key]) {
      byCategoryMonth[key] = { total: 0, monthKey, monthLabel };
    }

    byCategoryMonth[key].total += transaction.amount;
  });

  // Category time series
  const categorySeries = {};
  Object.entries(byCategoryMonth)?.forEach(([key, entry]) => {
    const [category, monthKey] = key.split("__");
    if (!categorySeries[category]) categorySeries[category] = [];
    categorySeries[category].push({
      monthKey,
      month: entry.monthLabel,
      total: entry.total,
    });
  });

  const anomalies = [];

  Object.entries(categorySeries)?.forEach(([category, series]) => {
    series.sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    const values = series.map((s) => s.total);

    // Evaluate last month only
    const latestIndex = series.length - 1;
    const { month, total } = series[latestIndex];
    const historyValues = values.slice(0, -1);

    if (historyValues.length < MIN_HISTORY_MONTHS) return;

    const median = getMedian(historyValues);
    const mad = getMAD(historyValues, median) || 1e-6;
    const deviationPercent = median !== 0 ? ((total - median) / median) * 100 : (total > 0 ? Infinity : 0);
    const historyMin = Math.min(...historyValues);
    const historyMax = Math.max(...historyValues);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    const robustZ = Math.abs((total - median) / (1.4826 * mad));
    const deviationAbsolute = total - median;

    const isMeaningfulIncrease =
      total > median &&
      total > historyMax &&
      deviationAbsolute >= MIN_ABSOLUTE_INCREASE &&
      deviationPercent >= MIN_PERCENT_INCREASE;

    if (robustZ < ROBUST_Z_THRESHOLD || !isMeaningfulIncrease) return;

    const previous = values[latestIndex - 1] || median;
    const trend =
      total > previous
        ? "increasing"
        : total < previous
          ? "decreasing"
          : "stable";

    const riskScore = getRiskScore(robustZ);

    const deviationLabel =
      deviationPercent >= 0
        ? `${Math.round(deviationPercent)}% more`
        : `${Math.abs(Math.round(deviationPercent))}% less`;

    const recentHistory = series.slice(-5, -1);
    const formattedHistory = recentHistory.map((item) => ({
      month: item.month,
      total: item.total,
    }));

    const anomaly = {
      id: `anomaly_${Math.random().toString(36).slice(2)}`,
      type: "anomaly",
      category,
      timestamp: new Date().toISOString(),

      risk: {
        score: riskScore,
        level: robustZ >= 5 ? "HIGH" : "MEDIUM",
        confidence: 0.8,
      },

      signal: {
        metric: "spending",
        month,
        current_value: total,
        baseline_value: median,
        deviation_percent: Math.round(deviationPercent),
        deviation_label: deviationLabel,
        deviation_absolute: Math.round(deviationAbsolute),
        robust_z_score: Number(robustZ.toFixed(2)),
        intensity: robustZ >= 5 ? "extreme" : "moderate",
        trend,
      },

      context: {
        months_analyzed: historyValues.length,
        highest_in_period: total === maxVal,
        lowest_in_period: total === minVal,
        previous_highest_value: historyMax,
        previous_lowest_value: historyMin,
        previous_value: previous,
        recent_history: formattedHistory,
      },

      impact: {
        type: "overspending",
        severity: robustZ >= 5 ? "HIGH" : "MEDIUM",
        impact_hint:
          deviationPercent > 100
            ? "may significantly affect balance"
            : "may affect balance",
      },

      recommendation: {
        action_type: "reduce_spending",
        action_hint: `Reduce spending in ${category}`,
      },
      meta: {
        source: "anomaly_engine",
      },
    };

    anomalies.push(anomaly);
  });

  return anomalies;
};
