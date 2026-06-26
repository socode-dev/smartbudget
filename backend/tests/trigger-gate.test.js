import { describe, expect, it } from "vitest";
import { evaluateTrigger } from "../ai/triggers/evaluateTrigger.js";
import {
  FAILED_RETRY_MS,
  REMINDER_INTERVAL_MS,
  RESERVED_LEASE_MS,
} from "../ai/triggers/utils.js";

describe("trigger gate", () => {
  it("allows a signal that has never been shown", () => {
    const result = evaluateTrigger({
      existing: null,
      trigger: { type: "cashflow", fingerprint: "cashflow-risk", snapshot: { outcome: "RISK" } },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "FIRST_TIME" });
  });

  it("blocks a signal when the same fingerprint has already fired", () => {
    const result = evaluateTrigger({
      existing: { status: "fired", fingerprint: "budget-food", snapshot: { compliance: "EXCEEDED", percentUsed: 120 } },
      trigger: { type: "budget", fingerprint: "budget-food", snapshot: { compliance: "EXCEEDED", percentUsed: 120 } },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: false, reason: "ALREADY_FIRED" });
  });

  it("allows cashflow when pressure increases by the threshold", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "cashflow-old",
        snapshot: { outcome: "WARNING", percentSpent: 70, hasNoIncome: false, spendingRunway: 10 },
        lastTriggeredAtMs: Date.now(),
      },
      trigger: {
        type: "cashflow",
        fingerprint: "cashflow-new",
        snapshot: { outcome: "WARNING", percentSpent: 80, hasNoIncome: false, spendingRunway: 10 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "CASHFLOW_PRESSURE_INCREASED" });
  });

  it("allows an anomaly when the fingerprint changes because spending increased", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "anomaly-old",
        snapshot: { severity: "HIGH", currentValue: 1000 },
      },
      trigger: {
        type: "anomaly",
        fingerprint: "anomaly-new",
        snapshot: { severity: "HIGH", currentValue: 1600 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "ANOMALY_INCREASED" });
  });

  it("allows budget insight when the signal snapshot changes compliance status", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "budget-old",
        snapshot: { compliance: "AT_RISK", percentUsed: 95 },
      },
      trigger: {
        type: "budget",
        fingerprint: "budget-new",
        snapshot: { compliance: "EXCEEDED", percentUsed: 101 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "BUDGET_STATUS_CHANGED" });
  });

  it("blocks reservations while the reservation lease is active", () => {
    const now = Date.now();
    const result = evaluateTrigger({
      existing: {
        status: "reserved",
        fingerprint: "cashflow-old",
        reservedAtMs: now - RESERVED_LEASE_MS + 1,
        snapshot: { outcome: "WARNING", percentSpent: 70, hasNoIncome: false },
      },
      trigger: {
        type: "cashflow",
        fingerprint: "cashflow-new",
        snapshot: { outcome: "RISK", percentSpent: 90, hasNoIncome: false },
      },
      now,
    });

    expect(result).toEqual({ allowed: false, reason: "ALREADY_RESERVED" });
  });

  it("blocks recent failed triggers until retry cooldown expires", () => {
    const now = Date.now();
    const result = evaluateTrigger({
      existing: {
        status: "failed",
        fingerprint: "budget-old",
        failedAtMs: now - FAILED_RETRY_MS + 1,
        snapshot: { compliance: "AT_RISK", percentUsed: 95 },
      },
      trigger: {
        type: "budget",
        fingerprint: "budget-new",
        snapshot: { compliance: "EXCEEDED", percentUsed: 110 },
      },
      now,
    });

    expect(result).toEqual({ allowed: false, reason: "RECENT_FAILURE" });
  });

  it("allows failed triggers after cooldown when the signal still changed", () => {
    const now = Date.now();
    const result = evaluateTrigger({
      existing: {
        status: "failed",
        fingerprint: "budget-old",
        failedAtMs: now - FAILED_RETRY_MS - 1,
        snapshot: { compliance: "AT_RISK", percentUsed: 95 },
      },
      trigger: {
        type: "budget",
        fingerprint: "budget-new",
        snapshot: { compliance: "EXCEEDED", percentUsed: 110 },
      },
      now,
    });

    expect(result).toEqual({ allowed: true, reason: "BUDGET_STATUS_CHANGED" });
  });

  it("allows cashflow reminders after the reminder interval expires", () => {
    const now = Date.now();
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "cashflow-old",
        lastTriggeredAtMs: now - REMINDER_INTERVAL_MS - 1,
        snapshot: { outcome: "WARNING", percentSpent: 70, hasNoIncome: false, spendingRunway: 8 },
      },
      trigger: {
        type: "cashflow",
        fingerprint: "cashflow-new",
        snapshot: { outcome: "WARNING", percentSpent: 70, hasNoIncome: false, spendingRunway: 8 },
      },
      now,
    });

    expect(result).toEqual({ allowed: true, reason: "CASHFLOW_REMINDER" });
  });

  it("allows a financial-risk insight when the risk level changes", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "risk-old",
        snapshot: { level: "MEDIUM", score: 55 },
      },
      trigger: {
        type: "financial-risk",
        fingerprint: "risk-new",
        snapshot: { level: "HIGH", score: 88 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "RISK_LEVEL_CHANGED" });
  });

  it("allows a financial-risk insight when score increases past the threshold", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "risk-old",
        snapshot: { level: "MEDIUM", score: 52 },
      },
      trigger: {
        type: "financial-risk",
        fingerprint: "risk-new",
        snapshot: { level: "MEDIUM", score: 68 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "RISK_SCORE_INCREASED" });
  });

  it("allows anomaly re-fire when severity changes", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "anomaly-old",
        snapshot: { severity: "MEDIUM", currentValue: 900 },
      },
      trigger: {
        type: "anomaly",
        fingerprint: "anomaly-new",
        snapshot: { severity: "HIGH", currentValue: 900 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "SEVERITY_CHANGED" });
  });

  it("allows budget re-fire when percent used changes materially", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "budget-old",
        snapshot: { compliance: "AT_RISK", percentUsed: 80 },
      },
      trigger: {
        type: "budget",
        fingerprint: "budget-new",
        snapshot: { compliance: "AT_RISK", percentUsed: 95 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "BUDGET_PERCENT_CHANGED" });
  });

  it("allows cashflow re-fire when outcome changes", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "cashflow-old",
        snapshot: { outcome: "WARNING", percentSpent: 70, hasNoIncome: false, spendingRunway: 8 },
      },
      trigger: {
        type: "cashflow",
        fingerprint: "cashflow-new",
        snapshot: { outcome: "RISK", percentSpent: 95, hasNoIncome: false, spendingRunway: 2 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "CASHFLOW_OUTCOME_CHANGED" });
  });

  it("allows cashflow re-fire when runway drops materially", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "cashflow-old",
        snapshot: { outcome: "WARNING", percentSpent: 70, hasNoIncome: false, spendingRunway: 10 },
      },
      trigger: {
        type: "cashflow",
        fingerprint: "cashflow-new",
        snapshot: { outcome: "WARNING", percentSpent: 72, hasNoIncome: false, spendingRunway: 3 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: true, reason: "CASHFLOW_RUNWAY_DROPPED" });
  });

  it("blocks unchanged anomaly snapshots after cooldown", () => {
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "anomaly-old",
        snapshot: { severity: "HIGH", currentValue: 900 },
      },
      trigger: {
        type: "anomaly",
        fingerprint: "anomaly-old",
        snapshot: { severity: "HIGH", currentValue: 900 },
      },
      now: Date.now(),
    });

    expect(result).toEqual({ allowed: false, reason: "ALREADY_FIRED" });
  });

  it("allows financial-risk reminders after the reminder interval expires", () => {
    const now = Date.now();
    const result = evaluateTrigger({
      existing: {
        status: "fired",
        fingerprint: "risk-same",
        lastTriggeredAtMs: now - REMINDER_INTERVAL_MS - 1,
        snapshot: { level: "HIGH", score: 87 },
      },
      trigger: {
        type: "financial-risk",
        fingerprint: "risk-same",
        snapshot: { level: "HIGH", score: 87 },
      },
      now,
    });

    expect(result).toEqual({ allowed: true, reason: "FINANCIAL_RISK_REMINDER" });
  });
});
