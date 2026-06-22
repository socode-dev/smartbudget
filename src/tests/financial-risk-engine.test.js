import { describe, expect, it, vi } from "vitest";
import { detectAnomalies } from "../insight_engines/anomalyDetection.js";
import { buildBudgetComplianceData } from "../insight_engines/budgetData.js";
import { buildCashFlowData } from "../insight_engines/cashFlowData.js";
import { buildRiskData } from "../insight_engines/riskData.js";
import {
  buildMultiCategorySpikeUser,
  cashflowRiskUser,
  budget,
  exceedingBudgetsUser,
  fixedSystemDate,
  normalUser,
  threeCategoryOverspendingUser,
} from "./fixtures/index.js";

const complianceFor = user =>
  user.budgets.map(budget => buildBudgetComplianceData(budget, user.transactions, user.currency));

const highAnomaly = (id, category = "Food", deviation = 260) => ({
  id,
  category,
  risk: { level: "HIGH", score: 82 },
  signal: { deviation_percent: deviation },
  context: { highest_in_period: true },
});

const exceededBudgetCompliance = (id, category, percentUsed) => ({
  id,
  category,
  derived: {
    compliance_status: "EXCEEDED",
    percent_budget_used: percentUsed,
    risk_level: "HIGH",
  },
});

const riskScoreOrZero = riskData => riskData?.risk?.score ?? 0;

describe("financial risk engine", () => {
  it("returns null when the user's overall risk is low", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const risk = buildRiskData(
      detectAnomalies(normalUser.transactions),
      complianceFor(normalUser),
      buildCashFlowData(normalUser.transactions, normalUser.currency),
      normalUser.transactions
    );

    expect(risk).toBeNull();

    vi.useRealTimers();
  });

  it("marks systemic crisis as high when multiple high anomalies and exceeded budgets exist", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const user = {
      ...threeCategoryOverspendingUser,
      budgets: [
        budget({ id: "budget-food", category: "Food", amount: 400 }),
        budget({ id: "budget-shopping", category: "Shopping", amount: 250 }),
      ],
    };

    const risk = buildRiskData(
      detectAnomalies(user.transactions),
      complianceFor(user),
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      user.transactions
    );

    expect(risk.risk.level).toBe("HIGH");
    expect(risk.financial_facts.is_systemic_crisis).toBe(true);

    vi.useRealTimers();
  });

  it("keeps a boundary medium risk below high when there is no systemic crisis", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const risk = buildRiskData(
      [
        highAnomaly("high-1", "Food", 320),
        highAnomaly("high-2", "Food", 300),
        highAnomaly("high-3", "Food", 280),
      ],
      [exceededBudgetCompliance("budget-food", "Food", 110)],
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      cashflowRiskUser.transactions
    );

    expect(risk).not.toBeNull();
    expect(risk.risk.score).toBeLessThan(80);
    expect(risk.risk.level).toBe("MEDIUM");
    expect(risk.financial_facts.is_systemic_crisis).toBe(false);

    vi.useRealTimers();
  });

  it("does not automatically mark high financial risk from a high anomaly alone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const risk = buildRiskData(
      [highAnomaly("high-anomaly-food")],
      complianceFor(normalUser),
      buildCashFlowData(normalUser.transactions, normalUser.currency),
      normalUser.transactions
    );

    expect(risk).toBeNull();
    expect(risk?.financial_facts?.is_systemic_crisis).not.toBe(true);

    vi.useRealTimers();
  });

  it("scores high cashflow pressure according to current scoring without forcing high risk", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const risk = buildRiskData(
      [],
      complianceFor(normalUser),
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      cashflowRiskUser.transactions
    );

    expect(risk).toBeNull();

    vi.useRealTimers();
  });

  it("does not mark budget-only pressure as high risk by itself", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const risk = buildRiskData(
      [],
      complianceFor(exceedingBudgetsUser),
      buildCashFlowData(normalUser.transactions, normalUser.currency),
      exceedingBudgetsUser.transactions
    );

    expect(risk?.risk?.level ?? "LOW").not.toBe("HIGH");
    expect(risk?.financial_facts?.is_systemic_crisis ?? false).toBe(false);

    vi.useRealTimers();
  });

  it("requires enough combined evidence before medium risk is emitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const anomalyOnly = buildRiskData(
      [highAnomaly("high-anomaly-food")],
      complianceFor(normalUser),
      buildCashFlowData(normalUser.transactions, normalUser.currency),
      normalUser.transactions
    );
    const anomalyWithCashflowRisk = buildRiskData(
      [
        highAnomaly("high-anomaly-food-1", "Food", 260),
        highAnomaly("high-anomaly-food-2", "Food", 250),
        highAnomaly("high-anomaly-food-3", "Food", 240),
      ],
      complianceFor(normalUser),
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      cashflowRiskUser.transactions
    );

    expect(anomalyOnly).toBeNull();
    expect(anomalyWithCashflowRisk?.risk?.level).toBe("MEDIUM");
    expect(anomalyWithCashflowRisk?.financial_facts?.cashflow_health).toBe("RISK");

    vi.useRealTimers();
  });

  it("requires the full signal combination before systemic crisis is detected", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const risk = buildRiskData(
      [highAnomaly("high-anomaly-food"), highAnomaly("high-anomaly-shopping", "Shopping")],
      complianceFor(normalUser),
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      normalUser.transactions
    );

    expect(risk?.financial_facts?.is_systemic_crisis).not.toBe(true);

    vi.useRealTimers();
  });

  it("does not decrease risk score when worse financial signals are introduced", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const mild = buildRiskData(
      [highAnomaly("high-anomaly-food")],
      complianceFor(normalUser),
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      cashflowRiskUser.transactions
    );
    const worse = buildRiskData(
      [highAnomaly("high-anomaly-food"), highAnomaly("high-anomaly-shopping", "Shopping")],
      complianceFor(exceedingBudgetsUser),
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      cashflowRiskUser.transactions
    );
    const systemicUser = {
      ...buildMultiCategorySpikeUser(3),
      budgets: [
        budget({ id: "budget-food", category: "Food", amount: 200 }),
        budget({ id: "budget-shopping", category: "Shopping", amount: 200 }),
      ],
    };
    const crisis = buildRiskData(
      detectAnomalies(systemicUser.transactions),
      complianceFor(systemicUser),
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      systemicUser.transactions
    );

    expect(riskScoreOrZero(worse)).toBeGreaterThanOrEqual(riskScoreOrZero(mild));
    expect(riskScoreOrZero(crisis)).toBeGreaterThanOrEqual(riskScoreOrZero(worse));
    expect(crisis.financial_facts.is_systemic_crisis).toBe(true);

    vi.useRealTimers();
  });

  it("maps financial facts to the underlying signal pressure", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const manyAnomalies = Array.from({ length: 3 }, (_, index) =>
      highAnomaly(`anomaly-${index}`, `Category ${index}`, 220)
    );

    const risk = buildRiskData(
      manyAnomalies,
      [exceededBudgetCompliance("budget-food", "Food", 120)],
      buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency),
      exceedingBudgetsUser.transactions
    );

    expect(risk.financial_facts.spending_pressure).toBe("HIGH");
    expect(risk.financial_facts.severe_spending_spikes).toBe(true);
    expect(risk.financial_facts.budget_discipline).toBe("WEAK");
    expect(risk.financial_facts.cashflow_health).toBe("RISK");
    expect(risk.signals.anomaly_signals.high_count).toBe(3);

    vi.useRealTimers();
  });
});
