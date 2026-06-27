import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../ai/services/aiClient.js", () => ({
  generateAIResponse: vi.fn(),
}));

vi.mock("../ai/orchestrator/triggerGate.js", () => ({
  checkSignalEligibility: vi.fn(),
  filterEligibleSignals: vi.fn(),
  markSignalTriggered: vi.fn(),
  markSignalTriggerFailed: vi.fn(),
  reserveSignalTrigger: vi.fn(),
}));

vi.mock("../ai/orchestrator/persistInsights.js", () => ({
  persistInsights: vi.fn(),
}));

vi.mock("../ai/orchestrator/attentionGate.js", () => ({
  evaluateAttentionGate: vi.fn(),
}));

vi.mock("../ai/orchestrator/attentionState.js", () => ({
  saveAttentionState: vi.fn(),
}));

vi.mock("../ai/services/anomaly.js", () => ({
  runAnomalyService: vi.fn(),
}));

vi.mock("../ai/services/budget.js", () => ({
  runBudgetService: vi.fn(),
}));

vi.mock("../ai/services/cashflow.js", () => ({
  runCashflowService: vi.fn(),
}));

vi.mock("../ai/services/risk.js", () => ({
  runRiskService: vi.fn(),
}));

import { runOrchestrator } from "../ai/services/orchestrator.js";
import { generateAIResponse } from "../ai/services/aiClient.js";
import {
  filterEligibleSignals,
  markSignalTriggered,
  markSignalTriggerFailed,
  reserveSignalTrigger,
} from "../ai/orchestrator/triggerGate.js";
import { evaluateAttentionGate } from "../ai/orchestrator/attentionGate.js";
import { saveAttentionState } from "../ai/orchestrator/attentionState.js";
import { persistInsights } from "../ai/orchestrator/persistInsights.js";
import { runAnomalyService } from "../ai/services/anomaly.js";
import { runBudgetService } from "../ai/services/budget.js";
import { runCashflowService } from "../ai/services/cashflow.js";
import { runRiskService } from "../ai/services/risk.js";

const anomaly = {
  id: "anomaly-food",
  category: "Food",
  risk: { level: "HIGH" },
  signal: { deviation_percent: 180, trend: "increasing", intensity: "extreme" },
  impact: { impact_hint: "may significantly affect balance" },
  context: { months_analyzed: 5 },
};

const entertainmentAnomaly = {
  id: "anomaly-entertainment",
  category: "Entertainment",
  risk: { level: "HIGH" },
  signal: { deviation_percent: 160, trend: "increasing", intensity: "extreme" },
  impact: { impact_hint: "may significantly affect balance" },
  context: { months_analyzed: 5 },
};

const exceededBudget = category => ({
  id: `budget-${category.toLowerCase()}`,
  category,
  derived: {
    risk_level: "HIGH",
    percent_budget_used: 140,
    projected_total: 700,
    compliance_status: "EXCEEDED",
    daily_burn_rate: 45,
  },
});

const riskData = {
  id: "risk-jun",
  period: { month: "Jun", year: "2026" },
  risk: { score: 88, level: "HIGH" },
  financial_facts: { is_systemic_crisis: true },
  signals: {
    anomaly_signals: { total_anomalies: 2 },
    budget_signals: { exceeded_count: 2 },
    cashflow_signals: { outcome: "RISK" },
    historical: { is_spending_increasing: true },
  },
};

const runPipeline = overrides =>
  runOrchestrator({
    userId: "user-orchestrator",
    anomalies: [anomaly, entertainmentAnomaly],
    budgetComplianceList: [exceededBudget("Food"), exceededBudget("Entertainment")],
    cashflowData: null,
    riskData,
    isDemo: true,
    ...overrides,
  });

describe("orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    evaluateAttentionGate.mockResolvedValue({ allowed: true, reason: "NO_ACTIVE_EPISODE" });
    saveAttentionState.mockResolvedValue(true);
    filterEligibleSignals.mockImplementation(async ({ signals }) => signals);
    reserveSignalTrigger.mockResolvedValue({ allowed: true });
    persistInsights.mockResolvedValue(true);
    generateAIResponse.mockResolvedValue({
      selectedSignalId: "risk-jun",
      selectedSignalType: "financial-risk",
      reason: "Systemic pressure is highest.",
      priority: "high",
    });
    runRiskService.mockResolvedValue({ id: "risk-jun", type: "financial-risk", agent: { explanation: "Risk insight" } });
    runAnomalyService.mockResolvedValue({ id: "anomaly-food", type: "anomaly", agent: { explanation: "Anomaly insight" } });
    runBudgetService.mockResolvedValue({ id: "budget-food", type: "budget", agent: { explanation: "Budget insight" } });
    runCashflowService.mockResolvedValue({ id: "cashflow-jun", type: "cashflow", agent: { explanation: "Cashflow insight" } });
  });

  it("runs only the top attention-approved signal", async () => {
    const result = await runPipeline();

    expect(evaluateAttentionGate).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-orchestrator",
      topSignal: expect.objectContaining({ id: "risk-jun", type: "financial-risk" }),
    }));
    expect(generateAIResponse).not.toHaveBeenCalled();
    expect(runRiskService).toHaveBeenCalledTimes(1);
    expect(runRiskService).toHaveBeenCalledWith({
      data: riskData,
      userId: "user-orchestrator",
      isDemo: true,
    });
    expect(runAnomalyService).not.toHaveBeenCalled();
    expect(result.insight).toMatchObject({ id: "risk-jun", type: "financial-risk" });
    expect(result.reason).toBe("NO_ACTIVE_EPISODE");
  });

  it("does not drain lower-ranked signals while the top episode is active", async () => {
    const result = await runPipeline();

    expect(filterEligibleSignals).toHaveBeenCalledWith({
      userId: "user-orchestrator",
      signals: [expect.objectContaining({ id: "risk-jun" })],
    });
    expect(runRiskService).toHaveBeenCalledTimes(1);
    expect(runAnomalyService).not.toHaveBeenCalled();
    expect(result.insight).toMatchObject({ id: "risk-jun", type: "financial-risk" });
  });

  it("blocks an insight when the attention gate says the active episode is unchanged", async () => {
    evaluateAttentionGate.mockResolvedValueOnce({ allowed: false, reason: "ACTIVE_EPISODE_UNCHANGED" });

    const result = await runPipeline();

    expect(result).toMatchObject({
      insight: null,
      reason: "ACTIVE_EPISODE_UNCHANGED",
    });
    expect(generateAIResponse).not.toHaveBeenCalled();
    expect(runRiskService).not.toHaveBeenCalled();
  });

  it("skips orchestration when trigger gate rejects every eligible signal", async () => {
    filterEligibleSignals.mockResolvedValueOnce([]);

    const result = await runPipeline();

    expect(result).toEqual({ insight: null, reason: "NO_ELIGIBLE_SIGNAL" });
    expect(generateAIResponse).not.toHaveBeenCalled();
  });

  it("returns only one insight per run and marks that selected signal triggered", async () => {
    const result = await runPipeline();

    expect(Array.isArray(result.insight)).toBe(false);
    expect(persistInsights).toHaveBeenCalledTimes(1);
    expect(markSignalTriggered).toHaveBeenCalledTimes(1);
    expect(saveAttentionState).toHaveBeenCalledTimes(1);
  });

  it("preserves deterministic engine output for the selected top signal", async () => {
    const result = await runPipeline();

    expect(result.insight).toMatchObject({ id: "risk-jun", type: "financial-risk" });
    expect(runRiskService).toHaveBeenCalledTimes(1);
  });

  it("marks the trigger failed and returns no insight when the agent throws", async () => {
    runRiskService.mockRejectedValueOnce(new Error("agent failed"));

    const result = await runPipeline();

    expect(result).toEqual({ insight: null, reason: "AGENT_EXECUTION_FAILED" });
    expect(markSignalTriggerFailed).toHaveBeenCalledTimes(1);
    expect(markSignalTriggered).not.toHaveBeenCalled();
  });

  it("marks the trigger failed and returns no insight when persistence fails", async () => {
    persistInsights.mockResolvedValueOnce(false);

    const result = await runPipeline();

    expect(result).toEqual({
      insight: expect.objectContaining({ id: "risk-jun", type: "financial-risk" }),
      reason: "INSIGHT_PERSISTENCE_FAILED",
    });
    expect(markSignalTriggerFailed).toHaveBeenCalledTimes(1);
    expect(markSignalTriggered).not.toHaveBeenCalled();
  });

  it("returns no insight when the top signal reservation loses a race", async () => {
    reserveSignalTrigger.mockResolvedValueOnce({ allowed: false, reason: "ALREADY_RESERVED" });

    const result = await runPipeline();

    expect(reserveSignalTrigger).toHaveBeenCalledTimes(1);
    expect(runAnomalyService).not.toHaveBeenCalled();
    expect(runRiskService).not.toHaveBeenCalled();
    expect(result).toEqual({ insight: null, reason: "NO_RESERVED_SELECTION" });
  });

  it("passes demo mode through to agent services without writing in demo runs", async () => {
    await runPipeline({ isDemo: true });
    expect(runRiskService).toHaveBeenCalledWith(expect.objectContaining({ isDemo: true }));

    vi.clearAllMocks();
    evaluateAttentionGate.mockResolvedValue({ allowed: true, reason: "NO_ACTIVE_EPISODE" });
    filterEligibleSignals.mockImplementation(async ({ signals }) => signals);
    reserveSignalTrigger.mockResolvedValue({ allowed: true });
    persistInsights.mockResolvedValue(true);
    generateAIResponse.mockResolvedValue({
      selectedSignalId: "risk-jun",
      selectedSignalType: "financial-risk",
      reason: "Systemic pressure is highest.",
      priority: "high",
    });
    runRiskService.mockResolvedValue({ id: "risk-jun", type: "financial-risk" });

    await runPipeline({ isDemo: false });
    expect(runRiskService).toHaveBeenCalledWith(expect.objectContaining({ isDemo: false }));
  });

  it("never lets the orchestrator mutate deterministic engine data passed to agents", async () => {
    const originalRisk = structuredClone(riskData);
    const originalAnomaly = structuredClone(anomaly);

    await runPipeline();

    expect(runRiskService.mock.calls[0][0].data).toEqual(originalRisk);
    expect(originalRisk).toEqual(riskData);

    await runPipeline({ anomalies: [anomaly], riskData: null });

    expect(runAnomalyService.mock.calls[0][0].data).toEqual(originalAnomaly);
    expect(originalAnomaly).toEqual(anomaly);
  });
});
