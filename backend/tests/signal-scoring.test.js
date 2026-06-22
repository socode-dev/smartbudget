import { describe, expect, it } from "vitest";
import { normalizeSignals } from "../ai/orchestrator/normalizeSignals.js";
import { scoreSignals } from "../ai/orchestrator/scoreSignals.js";

const anomaly = {
  id: "anomaly-food",
  category: "Food",
  risk: { level: "HIGH" },
  signal: { deviation_percent: 180, trend: "increasing", intensity: "extreme" },
  impact: { impact_hint: "may significantly affect balance" },
  context: { months_analyzed: 5 },
};

const exceededBudget = {
  id: "budget-food",
  category: "Food",
  derived: {
    risk_level: "HIGH",
    percent_budget_used: 140,
    projected_total: 700,
    compliance_status: "EXCEEDED",
    daily_burn_rate: 46.67,
  },
};

const manualSignals = [
  { id: "risk-jun", type: "financial-risk", severity: "HIGH", orchestrationContext: { riskScore: 90 } },
  { id: "budget-food", type: "budget", severity: "HIGH", orchestrationContext: { percentUsed: 130, compliance: "EXCEEDED" } },
  { id: "cashflow-jun", type: "cashflow", severity: "WARNING", orchestrationContext: { outcome: "WARNING" } },
];

describe("signal scoring", () => {
  it("normalizes engine outputs into ranked signal candidates", () => {
    const signals = normalizeSignals({
      anomalies: [anomaly],
      budgetComplianceList: [exceededBudget],
      cashflowData: {
        id: "cashflow-jun",
        outcome: "WARNING",
        spending: { current_balance: 300 },
        forecast: { projected_remaining_balance: 0, spending_runway_days: 4 },
        derived: { has_no_income: false, projection_confidence: "HIGH" },
      },
      riskData: null,
    });

    expect(signals.map(signal => signal.type)).toEqual(["anomaly", "budget", "cashflow"]);
    expect(signals[0].data).toBe(anomaly);
  });

  it("orders risk, budget, and cashflow by the engine urgency formula", () => {
    const scored = scoreSignals({ signals: manualSignals });

    expect(scored.map(signal => signal.id)).toEqual(["budget-food", "risk-jun", "cashflow-jun"]);
    expect(scored[0].urgencyScore).toBeGreaterThan(scored[1].urgencyScore);
    expect(scored[1].urgencyScore).toBeGreaterThanOrEqual(scored[2].urgencyScore);
  });

  it("picks the highest urgency signal first", () => {
    const [topSignal] = scoreSignals({
      signals: normalizeSignals({
        anomalies: [anomaly],
        budgetComplianceList: [exceededBudget],
        cashflowData: null,
        riskData: null,
      }),
    });

    expect(topSignal.id).toBe("anomaly-food");
    expect(topSignal.urgencyScore).toBeGreaterThan(0);
  });

  it("boosts financial risk when high anomalies and exceeded budgets create systemic pressure", () => {
    const scored = scoreSignals({
      signals: [
        { id: "anomaly-food", type: "anomaly", severity: "HIGH", orchestrationContext: { deviationPercent: 180, intensity: "extreme" } },
        { id: "anomaly-shopping", type: "anomaly", severity: "HIGH", orchestrationContext: { deviationPercent: 150, intensity: "extreme" } },
        { id: "budget-food", type: "budget", severity: "HIGH", orchestrationContext: { percentUsed: 130, compliance: "EXCEEDED" } },
        { id: "budget-shopping", type: "budget", severity: "HIGH", orchestrationContext: { percentUsed: 140, compliance: "EXCEEDED" } },
        { id: "risk-jun", type: "financial-risk", severity: "HIGH", orchestrationContext: { riskScore: 70 } },
      ],
    });

    expect(scored[0].id).toBe("risk-jun");
    expect(scored[0].urgencyScore).toBeGreaterThan(scored[1].urgencyScore);
  });

  it("keeps equal urgency ties in deterministic input order", () => {
    const signals = [
      { id: "cashflow-a", type: "cashflow", severity: "WARNING", orchestrationContext: { outcome: "WARNING" } },
      { id: "cashflow-b", type: "cashflow", severity: "WARNING", orchestrationContext: { outcome: "WARNING" } },
    ];

    const scored = scoreSignals({ signals });

    expect(scored.map(signal => signal.id)).toEqual(["cashflow-a", "cashflow-b"]);
    expect(scored[0].urgencyScore).toBe(scored[1].urgencyScore);
  });

  it("only changes the urgency of the signal whose context changed", () => {
    const baseline = scoreSignals({ signals: manualSignals });
    const changed = scoreSignals({
      signals: manualSignals.map(signal =>
        signal.id === "cashflow-jun"
          ? { ...signal, orchestrationContext: { outcome: "RISK" } }
          : signal
      ),
    });

    expect(baseline.map(signal => signal.id)).toEqual(["budget-food", "risk-jun", "cashflow-jun"]);
    expect(changed.map(signal => signal.id)).toEqual(["cashflow-jun", "budget-food", "risk-jun"]);
    expect(changed.find(signal => signal.id === "budget-food")?.urgencyScore).toBe(
      baseline.find(signal => signal.id === "budget-food")?.urgencyScore
    );
    expect(changed.find(signal => signal.id === "risk-jun")?.urgencyScore).toBe(
      baseline.find(signal => signal.id === "risk-jun")?.urgencyScore
    );
  });

  it("does not silently remove duplicate signals before orchestration", () => {
    const duplicateSignals = [
      { id: "budget-food", type: "budget", severity: "HIGH", orchestrationContext: { percentUsed: 130, compliance: "EXCEEDED" } },
      { id: "budget-food", type: "budget", severity: "HIGH", orchestrationContext: { percentUsed: 130, compliance: "EXCEEDED" } },
    ];

    const scored = scoreSignals({ signals: duplicateSignals });

    expect(scored).toHaveLength(2);
    expect(scored[0]).not.toBe(scored[1]);
    expect(scored.map(signal => signal.id)).toEqual(["budget-food", "budget-food"]);
  });

  it("assigns unknown signal types zero urgency without crashing", () => {
    const scored = scoreSignals({
      signals: [
        { id: "unknown-signal", type: "unknown", severity: "HIGH", orchestrationContext: {} },
        { id: "cashflow-risk", type: "cashflow", severity: "RISK", orchestrationContext: { outcome: "RISK" } },
      ],
    });

    expect(scored.at(-1)).toMatchObject({ id: "unknown-signal", urgencyScore: 0 });
  });

  it("returns stable ordering across repeated scoring runs", () => {
    const signals = [
      { id: "budget-food", type: "budget", severity: "HIGH", orchestrationContext: { percentUsed: 130, compliance: "EXCEEDED" } },
      { id: "cashflow-risk", type: "cashflow", severity: "RISK", orchestrationContext: { outcome: "RISK" } },
      { id: "unknown-signal", type: "unknown", severity: "HIGH", orchestrationContext: {} },
    ];

    const firstRun = scoreSignals({ signals }).map(signal => [signal.id, signal.urgencyScore]);
    const secondRun = scoreSignals({ signals }).map(signal => [signal.id, signal.urgencyScore]);

    expect(secondRun).toEqual(firstRun);
  });

  it("normalizes financial-risk signals when risk data is present", () => {
    const signals = normalizeSignals({
      anomalies: [],
      budgetComplianceList: [],
      cashflowData: null,
      riskData: {
        id: "risk-jun",
        risk: { score: 88, level: "HIGH" },
        signals: {
          anomaly_signals: { total_anomalies: 2 },
          budget_signals: { exceeded_count: 2 },
          cashflow_signals: { outcome: "RISK" },
          historical: { is_spending_increasing: true },
        },
      },
    });

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: "risk-jun",
      type: "financial-risk",
      orchestrationContext: {
        riskScore: 88,
        anomalyCount: 2,
        exceededBudgets: 2,
        cashflowOutcome: "RISK",
        spendingTrend: true,
      },
    });
  });
});
