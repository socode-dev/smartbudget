import { describe, expect, it, vi } from "vitest";
import { buildCashFlowData } from "../insight_engines/cashFlowData.js";
import {
  cashflowBreakEvenUser,
  cashflowRiskUser,
  cashflowWithFutureTransactionsUser,
  edgeCaseUsers,
  expense,
  fixedSystemDate,
  income,
  incomeAfterSpendingUser,
  monthIsolationUser,
  multipleIncomeSourcesUser,
  noIncomeUser,
  normalUser,
} from "./fixtures/index.js";

const expectAccountingInvariant = result => {
  const expectedBalance = Math.max(0, Number((result.income.total - result.spending.total_spent).toFixed(2)));

  expect(result.spending.current_balance).toBe(expectedBalance);
};

const expectProjectionInvariant = result => {
  if (result.derived.projection_confidence === "LOW") {
    expect(result.forecast.projected_total_spend).toBeNull();
    expect(result.forecast.projected_remaining_balance).toBeNull();
    return;
  }

  const totalDaysInMonth = result.period.days_elapsed + result.period.days_remaining;
  const roundedDailyBurnRate = Number((result.spending.total_spent / result.period.days_elapsed).toFixed(2));
  const rawProjectedSpend = Number((roundedDailyBurnRate * totalDaysInMonth).toFixed(2));
  const expectedProjectedSpend = Math.min(
    rawProjectedSpend,
    result.income.total > 0 ? result.income.total * 2 : rawProjectedSpend
  );
  const expectedRemainingBalance = Number(Math.max(0, result.income.total - expectedProjectedSpend).toFixed(2));

  expect(result.forecast.projected_total_spend).toBe(expectedProjectedSpend);
  expect(result.forecast.projected_remaining_balance).toBe(expectedRemainingBalance);
};

describe("cashflow engine", () => {
  it("returns a safe cashflow signal for normal current-month spending", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(normalUser.transactions, normalUser.currency);

    expect(result.outcome).toBe("SAFE");
    expect(result.income.total).toBe(4200);
    expect(result.spending.current_balance).toBeGreaterThan(0);
    expectAccountingInvariant(result);
    expectProjectionInvariant(result);

    vi.useRealTimers();
  });

  it("flags current-month cashflow risk when spending is almost all income", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(cashflowRiskUser.transactions, cashflowRiskUser.currency);

    expect(result.outcome).toBe("RISK");
    expect(result.derived.percent_spent).toBe(98);
    expect(result.forecast.projected_remaining_balance).toBe(0);
    expectAccountingInvariant(result);
    expectProjectionInvariant(result);

    vi.useRealTimers();
  });

  it("captures the warning threshold at 85% projected spend", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const warningUser = {
      ...normalUser,
      transactions: [
        income({ id: "income-jun", amount: 4000, month: 6 }),
        expense({ id: "spend-jun", category: "Food", amount: 1700.1, month: 6, day: 10 }),
      ],
    };

    const result = buildCashFlowData(warningUser.transactions, warningUser.currency);

    expect(result.forecast.projected_total_spend).toBeGreaterThanOrEqual(3400);
    expect(result.outcome).toBe("WARNING");
    expectAccountingInvariant(result);
    expectProjectionInvariant(result);

    vi.useRealTimers();
  });

  it("marks spending without income as risk", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(noIncomeUser.transactions, noIncomeUser.currency);

    expect(result.derived.has_no_income).toBe(true);
    expect(result.outcome).toBe("RISK");
    expectAccountingInvariant(result);
    expectProjectionInvariant(result);

    vi.useRealTimers();
  });

  it("returns safe cashflow for empty transactions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(edgeCaseUsers.emptyTransactions.transactions, edgeCaseUsers.emptyTransactions.currency);

    expect(result.income.total).toBe(0);
    expect(result.spending.total_spent).toBe(0);
    expect(result.outcome).toBe("SAFE");
    expectAccountingInvariant(result);
    expectProjectionInvariant(result);

    vi.useRealTimers();
  });

  it("keeps accounting correct when income arrives after early spending", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(incomeAfterSpendingUser.transactions, incomeAfterSpendingUser.currency);

    expect(result.income.total).toBe(3500);
    expect(result.spending.total_spent).toBe(1600);
    expectAccountingInvariant(result);
    expectProjectionInvariant(result);

    vi.useRealTimers();
  });

  it("aggregates multiple income sources into total income", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(multipleIncomeSourcesUser.transactions, multipleIncomeSourcesUser.currency);

    expect(result.income.total).toBe(4350);
    expect(result.spending.total_spent).toBe(700);
    expectAccountingInvariant(result);

    vi.useRealTimers();
  });

  it("isolates current-month cashflow from previous-month expenses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(monthIsolationUser.transactions, monthIsolationUser.currency);

    expect(result.income.total).toBe(4000);
    expect(result.spending.total_spent).toBe(400);
    expectAccountingInvariant(result);

    vi.useRealTimers();
  });

  it("returns deterministic cashflow output for identical data", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const runs = Array.from({ length: 3 }, () =>
      buildCashFlowData(normalUser.transactions, normalUser.currency)
    );

    const normalize = result => ({ ...result, id: "stable-id" });

    expect(normalize(runs[1])).toEqual(normalize(runs[0]));
    expect(normalize(runs[2])).toEqual(normalize(runs[0]));

    vi.useRealTimers();
  });

  it("ignores future-month transactions when calculating current cashflow", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(
      cashflowWithFutureTransactionsUser.transactions,
      cashflowWithFutureTransactionsUser.currency
    );

    expect(result.income.total).toBe(4000);
    expect(result.spending.total_spent).toBe(400);
    expect(result.outcome).toBe("SAFE");

    vi.useRealTimers();
  });

  it("handles the boundary when spending exactly equals income", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildCashFlowData(cashflowBreakEvenUser.transactions, cashflowBreakEvenUser.currency);

    expect(result.income.total).toBe(4000);
    expect(result.spending.total_spent).toBe(4000);
    expect(result.spending.current_balance).toBe(0);
    expect(result.derived.percent_spent).toBe(100);
    expectAccountingInvariant(result);
    expectProjectionInvariant(result);

    vi.useRealTimers();
  });

  it("marks spending above income as risk", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const overspendUser = {
      ...cashflowBreakEvenUser,
      transactions: [
        ...cashflowBreakEvenUser.transactions,
        expense({ id: "extra-jun", category: "Shopping", amount: 250, month: 6, day: 14 }),
      ],
    };

    const result = buildCashFlowData(overspendUser.transactions, overspendUser.currency);

    expect(result.spending.total_spent).toBeGreaterThan(result.income.total);
    expect(result.outcome).toBe("RISK");

    vi.useRealTimers();
  });
});
