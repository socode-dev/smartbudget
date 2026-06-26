import { describe, expect, it } from "vitest";
import {
  ATTENTION_COOLDOWN_MS,
  evaluateAttentionDecision,
} from "../ai/orchestrator/attentionGate.js";

const financialRiskSignal = overrides => ({
  id: "risk-jun",
  type: "financial-risk",
  severity: "HIGH",
  urgencyScore: 80,
  orchestrationContext: {
    riskScore: 87,
    cashflowOutcome: "RISK",
    anomalyCount: 3,
    exceededBudgets: 3,
    spendingTrend: true,
  },
  data: {
    period: { month: "Jun", year: "2026" },
    risk: { score: 87, level: "HIGH" },
    financial_facts: { is_systemic_crisis: true },
    signals: {
      cashflow_signals: { outcome: "RISK" },
    },
  },
  ...overrides,
});

const activeRiskEpisode = overrides => ({
  episodeKey: "financial-risk:Jun:2026",
  type: "financial-risk",
  severity: "HIGH",
  urgencyScore: 80,
  period: { month: "Jun", year: "2026" },
  lastInsightAtMs: 1000,
  snapshot: {
    riskScore: 87,
    cashflowOutcome: "RISK",
    systemicCrisis: true,
  },
  coveredSignals: {
    anomalyCategories: ["Food", "Entertainment"],
    anomalySnapshots: {
      Food: { value: 1630, percent: 196, severity: "HIGH" },
      Entertainment: { value: 1150, percent: 334, severity: "HIGH" },
    },
    budgetCategories: ["Food"],
    budgetSnapshots: {
      Food: { value: 181, percent: 181, severity: "HIGH" },
    },
    cashflowOutcome: "RISK",
    cashflowSnapshot: { outcome: "RISK", percentSpent: 467 },
  },
  ...overrides,
});

describe("attention gate", () => {
  it("allows the first episode when no active attention state exists", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: null,
      topSignal: financialRiskSignal(),
    })).toEqual({ allowed: true, reason: "NO_ACTIVE_EPISODE" });
  });

  it("blocks an unchanged active financial-risk episode", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode(),
      topSignal: financialRiskSignal(),
      now: 2000,
    })).toEqual({ allowed: false, reason: "ACTIVE_EPISODE_UNCHANGED" });
  });

  it("allows financial-risk when the risk score materially increases", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode({ snapshot: { riskScore: 73, cashflowOutcome: "RISK", systemicCrisis: true } }),
      topSignal: financialRiskSignal(),
      now: 2000,
    })).toEqual({ allowed: true, reason: "RISK_SCORE_INCREASED" });
  });

  it("suppresses category signals already covered by active systemic risk", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode(),
      topSignal: {
        id: "anomaly-food",
        type: "anomaly",
        severity: "HIGH",
        urgencyScore: 50,
        data: { category: "Food", signal: { month: "2026, Jun" } },
      },
      now: 2000,
    })).toEqual({ allowed: false, reason: "SUPPRESSED_BY_ACTIVE_EPISODE" });
  });

  it("allows a new high-severity category outside the active episode", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode(),
      topSignal: {
        id: "anomaly-medical",
        type: "anomaly",
        severity: "HIGH",
        urgencyScore: 70,
        data: { category: "Medical", signal: { month: "2026, Jun" } },
      },
      now: 2000,
    })).toEqual({ allowed: true, reason: "NEW_MATERIAL_SIGNAL", signalId: "anomaly-medical" });
  });

  it("can nominate a new material signal even when financial-risk remains top", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode(),
      topSignal: financialRiskSignal(),
      scoredSignals: [
        financialRiskSignal(),
        {
          id: "anomaly-medical",
          type: "anomaly",
          severity: "HIGH",
          urgencyScore: 70,
          data: { category: "Medical", signal: { month: "2026, Jun" } },
        },
      ],
      now: 2000,
    })).toEqual({ allowed: true, reason: "NEW_MATERIAL_SIGNAL", signalId: "anomaly-medical" });
  });

  it("allows a covered category when the supporting signal materially worsens", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode(),
      topSignal: financialRiskSignal(),
      scoredSignals: [
        financialRiskSignal(),
        {
          id: "anomaly-entertainment-jun",
          type: "anomaly",
          severity: "HIGH",
          urgencyScore: 63,
          data: {
            category: "Entertainment",
            signal: { month: "2026, Jun", current_value: 1800, deviation_percent: 579 },
          },
        },
      ],
      now: 2000,
    })).toEqual({
      allowed: true,
      reason: "SUPPORTING_SIGNAL_WORSENED",
      signalId: "anomaly-entertainment-jun",
    });
  });

  it("suppresses a covered category when the supporting signal only changes slightly", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode(),
      topSignal: financialRiskSignal(),
      scoredSignals: [
        financialRiskSignal(),
        {
          id: "anomaly-entertainment-small-change",
          type: "anomaly",
          severity: "HIGH",
          urgencyScore: 58,
          data: {
            category: "Entertainment",
            signal: { month: "2026, Jun", current_value: 1200, deviation_percent: 353 },
          },
        },
      ],
      now: 2000,
    })).toEqual({ allowed: false, reason: "ACTIVE_EPISODE_UNCHANGED" });
  });

  it("allows a reminder after cooldown expires", () => {
    expect(evaluateAttentionDecision({
      activeEpisode: activeRiskEpisode(),
      topSignal: financialRiskSignal(),
      now: 1000 + ATTENTION_COOLDOWN_MS + 1,
    })).toEqual({ allowed: true, reason: "COOLDOWN_EXPIRED" });
  });
});
