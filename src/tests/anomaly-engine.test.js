import { describe, expect, it } from "vitest";
import { detectAnomalies } from "../insight_engines/anomalyDetection.js";
import {
  buildMultiCategorySpikeUser,
  edgeCaseUsers,
  independentCategorySpikeUser,
  limitedHistoryUser,
  mediumSeverityAnomalyUser,
  newCategoryUser,
  oneCategoryOverspendingUser,
  persistentSpikeUser,
  refundUser,
  sparseHistoryTwoMonthUser,
  steadySpendingUser,
  threeCategoryOverspendingUser,
} from "./fixtures/index.js";

const deterministicAnomalies = anomalies =>
  anomalies.map(({ id, timestamp, ...anomaly }) => ({
    ...anomaly,
    risk: { ...anomaly.risk },
    signal: { ...anomaly.signal },
    context: { ...anomaly.context },
    impact: { ...anomaly.impact },
    recommendation: { ...anomaly.recommendation },
    meta: { ...anomaly.meta },
  }));

const latestMonthLabel = "2026, Jun";

describe("anomaly engine", () => {
  it("returns an anomaly signal when one category spikes above real history", () => {
    const result = detectAnomalies(oneCategoryOverspendingUser.transactions);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      type: "anomaly",
      category: "Food",
      risk: { level: "HIGH" },
      signal: {
        current_value: 900,
        baseline_value: 500,
        deviation_percent: 80,
        month: latestMonthLabel,
      },
      meta: { source: "anomaly_engine" },
    });
  });

  it("captures the boundary where at least two high anomalies exist", () => {
    const result = detectAnomalies(threeCategoryOverspendingUser.transactions);
    const highAnomalies = result.filter(anomaly => anomaly.risk.level === "HIGH");

    expect(highAnomalies.length).toBeGreaterThanOrEqual(2);
  });

  it.each([2, 3, 5, 10])("detects %i independent category anomalies when each category spikes", count => {
    const user = buildMultiCategorySpikeUser(count);
    const result = detectAnomalies(user.transactions);

    expect(result.length).toBe(count);
    expect(new Set(result.map(anomaly => anomaly.category)).size).toBe(count);
  });

  it("never flags stable monthly spending as an anomaly", () => {
    expect(detectAnomalies(steadySpendingUser.transactions)).toEqual([]);
  });

  it("uses only prior months as baseline and never compares June against itself", () => {
    const result = detectAnomalies(oneCategoryOverspendingUser.transactions)[0];

    expect(result.signal.month).toBe(latestMonthLabel);
    expect(result.context.months_analyzed).toBe(5);
    expect(result.context.recent_history.every(entry => entry.month !== latestMonthLabel)).toBe(true);
    expect(result.context.recent_history.map(entry => entry.total)).toEqual([500, 500, 500, 500]);
  });

  it("assigns HIGH severity for extreme spikes and MEDIUM for moderate spikes", () => {
    const high = detectAnomalies(oneCategoryOverspendingUser.transactions)[0];
    const medium = detectAnomalies(mediumSeverityAnomalyUser.transactions);

    expect(high.risk.level).toBe("HIGH");
    expect(high.signal.intensity).toBe("extreme");
    expect(medium).toHaveLength(1);
    expect(medium[0].risk.level).toBe("MEDIUM");
    expect(medium[0].signal.intensity).toBe("moderate");
  });

  it("isolates a Food spike from Transport, Shopping, and Rent baselines", () => {
    const result = detectAnomalies(independentCategorySpikeUser.transactions);

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("Food");
    expect(result.map(anomaly => anomaly.category)).not.toContain("Transport");
    expect(result.map(anomaly => anomaly.category)).not.toContain("Shopping");
    expect(result.map(anomaly => anomaly.category)).not.toContain("Rent");
  });

  it("does not flag a brand-new category with no historical baseline", () => {
    expect(detectAnomalies(newCategoryUser.transactions)).toEqual([]);
  });

  it("refuses to emit a signal when only two months of history exist", () => {
    expect(detectAnomalies(sparseHistoryTwoMonthUser.transactions)).toEqual([]);
    expect(detectAnomalies(limitedHistoryUser.transactions)).toEqual([]);
  });

  it("does not treat refunds as spending spikes", () => {
    expect(detectAnomalies(refundUser.transactions)).toEqual([]);
  });

  it("returns no anomaly for empty transactions", () => {
    expect(detectAnomalies(edgeCaseUsers.emptyTransactions.transactions)).toEqual([]);
  });

  it("ignores invalid dates instead of producing a false signal", () => {
    expect(detectAnomalies(edgeCaseUsers.invalidDates.transactions)).toEqual([]);
  });

  it("does not create duplicate anomaly signals for persistent high spending", () => {
    const result = detectAnomalies(persistentSpikeUser.transactions);

    expect(result.length).toBeLessThanOrEqual(1);
    expect(new Set(result.map(anomaly => anomaly.category)).size).toBe(result.length);
  });

  it("returns deterministic financial anomaly content for the same dataset", () => {
    const runs = Array.from({ length: 3 }, () =>
      deterministicAnomalies(detectAnomalies(oneCategoryOverspendingUser.transactions))
    );

    expect(runs[1]).toEqual(runs[0]);
    expect(runs[2]).toEqual(runs[0]);
  });
});
