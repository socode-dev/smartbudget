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
  checkSignalEligibility,
  filterEligibleSignals,
  markSignalTriggered,
  markSignalTriggerFailed,
  reserveSignalTrigger,
} from "../ai/orchestrator/triggerGate.js";
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
    anomalies: [anomaly],
    budgetComplianceList: [],
    cashflowData: null,
    riskData,
    isDemo: true,
    ...overrides,
  });

describe("orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    checkSignalEligibility.mockResolvedValue({ allowed: true, reason: "FIRST_TIME" });
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

  it("calls the LLM only for the selected highest-urgency signal", async () => {
    const insight = await runPipeline();

    expect(generateAIResponse).toHaveBeenCalledTimes(1);
    expect(runRiskService).toHaveBeenCalledTimes(1);
    expect(runRiskService).toHaveBeenCalledWith({
      data: riskData,
      userId: "user-orchestrator",
      isDemo: true,
    });
    expect(runAnomalyService).not.toHaveBeenCalled();
    expect(insight).toMatchObject({ id: "risk-jun", type: "financial-risk" });
  });

  it("obeys the LLM when it selects a valid lower-ranked signal", async () => {
    generateAIResponse.mockResolvedValueOnce({
      selectedSignalId: "anomaly-food",
      selectedSignalType: "anomaly",
      reason: "The category spike is the most actionable issue right now.",
      priority: "high",
    });

    const insight = await runPipeline();

    expect(runAnomalyService).toHaveBeenCalledTimes(1);
    expect(runRiskService).not.toHaveBeenCalled();
    expect(insight).toMatchObject({ id: "anomaly-food", type: "anomaly" });
  });

  it("blocks an insight when the top trigger has already fired and does not call the LLM", async () => {
    checkSignalEligibility.mockResolvedValueOnce({ allowed: false, reason: "ALREADY_FIRED" });

    const result = await runPipeline();

    expect(result).toHaveProperty("scoredSignals");
    expect(generateAIResponse).not.toHaveBeenCalled();
    expect(runRiskService).not.toHaveBeenCalled();
  });

  it("skips orchestration when trigger gate rejects every eligible signal", async () => {
    filterEligibleSignals.mockResolvedValueOnce([]);

    const result = await runPipeline();

    expect(result).toEqual([]);
    expect(generateAIResponse).not.toHaveBeenCalled();
  });

  it("returns only one insight per run and marks that selected signal triggered", async () => {
    const insight = await runPipeline();

    expect(Array.isArray(insight)).toBe(false);
    expect(persistInsights).toHaveBeenCalledTimes(1);
    expect(markSignalTriggered).toHaveBeenCalledTimes(1);
  });

  it("preserves deterministic engine output when the LLM decision is invalid", async () => {
    generateAIResponse.mockResolvedValueOnce({
      selectedSignalId: "missing-signal",
      selectedSignalType: "financial-risk",
      reason: "Invalid id",
      priority: "high",
    });

    const insight = await runPipeline();

    expect(insight).toMatchObject({ id: "risk-jun", type: "financial-risk" });
    expect(runRiskService).toHaveBeenCalledTimes(1);
  });

  it("falls back to the top scored signal when the LLM returns malformed JSON", async () => {
    generateAIResponse.mockResolvedValueOnce({
      selectedSignalId: "risk-jun",
    });

    const insight = await runPipeline();

    expect(insight).toMatchObject({ id: "risk-jun", type: "financial-risk" });
  });

  it("throws when the orchestration LLM fails instead of silently continuing", async () => {
    generateAIResponse.mockRejectedValueOnce(new Error("timeout"));

    await expect(runPipeline()).rejects.toThrow("ORCHESTRATOR_LLM_FAILED");
    expect(runRiskService).not.toHaveBeenCalled();
  });

  it("marks the trigger failed and returns no insight when the agent throws", async () => {
    runRiskService.mockRejectedValueOnce(new Error("agent failed"));

    const result = await runPipeline();

    expect(result).toEqual([]);
    expect(markSignalTriggerFailed).toHaveBeenCalledTimes(1);
    expect(markSignalTriggered).not.toHaveBeenCalled();
  });

  it("marks the trigger failed and returns no insight when persistence fails", async () => {
    persistInsights.mockResolvedValueOnce(false);

    const result = await runPipeline();

    expect(result).toEqual([]);
    expect(markSignalTriggerFailed).toHaveBeenCalledTimes(1);
    expect(markSignalTriggered).not.toHaveBeenCalled();
  });

  it("reserves the next candidate when the first reservation loses a race", async () => {
    reserveSignalTrigger
      .mockResolvedValueOnce({ allowed: false, reason: "ALREADY_RESERVED" })
      .mockResolvedValueOnce({ allowed: true, reason: "FIRST_TIME" });

    const insight = await runPipeline();

    expect(reserveSignalTrigger).toHaveBeenCalledTimes(2);
    expect(runAnomalyService).toHaveBeenCalledTimes(1);
    expect(runRiskService).not.toHaveBeenCalled();
    expect(insight).toMatchObject({ id: "anomaly-food", type: "anomaly" });
  });

  it("passes demo mode through to agent services without writing in demo runs", async () => {
    await runPipeline({ isDemo: true });
    expect(runRiskService).toHaveBeenCalledWith(expect.objectContaining({ isDemo: true }));

    vi.clearAllMocks();
    checkSignalEligibility.mockResolvedValue({ allowed: true, reason: "FIRST_TIME" });
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

    generateAIResponse.mockResolvedValueOnce({
      selectedSignalId: "anomaly-food",
      selectedSignalType: "anomaly",
      reason: "Anomaly is actionable.",
      priority: "high",
    });

    await runPipeline({ anomalies: [anomaly], riskData: null });

    expect(runAnomalyService.mock.calls[0][0].data).toEqual(originalAnomaly);
    expect(originalAnomaly).toEqual(anomaly);
  });
});
