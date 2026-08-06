import { describe, expect, it, vi } from "vitest";
import { buildBudgetComplianceData } from "../financial-signals/budget.js";
import {
  budget,
  budgetAt200User,
  budgetAt99User,
  budgetNoSpendingUser,
  edgeCaseUsers,
  exceedingBudgetsUser,
  fixedSystemDate,
  futureBudgetUser,
  multipleBudgetUser,
  previousMonthBudgetUser,
} from "./fixtures/index.js";

describe("budget engine", () => {
  it("marks a real category as exceeded when spending reaches the budget", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildBudgetComplianceData({
      budget: exceedingBudgetsUser.budgets[0],
      transactions: exceedingBudgetsUser.transactions,
      currency: "NGN"
    });

    expect(result).toMatchObject({
      category: "Food",
      budget: { amount: 500, currency: "NGN" },
      spending: { total_spent: 500, transaction_count: 2 },
      derived: {
        percent_budget_used: 100,
        compliance_status: "EXCEEDED",
        risk_level: "HIGH",
      },
    });

    vi.useRealTimers();
  });

  it("treats exactly 100% budget used as exceeded", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildBudgetComplianceData({
      budget: exceedingBudgetsUser.budgets[0],
      transactions: exceedingBudgetsUser.transactions,
      currency: "NGN"
    });

    expect(result.derived.percent_budget_used).toBe(100);
    expect(result.derived.compliance_status).toBe("EXCEEDED");

    vi.useRealTimers();
  });

  it("keeps 99% usage on track at month end when pace is still below elapsed time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00.000Z"));

    const result = buildBudgetComplianceData({
      budget: budgetAt99User.budgets[0],
      transactions: budgetAt99User.transactions,
      currency: "NGN"
    });

    expect(result.derived.percent_budget_used).toBe(99);
    expect(result.derived.compliance_status).toBe("ON_TRACK");

    vi.useRealTimers();
  });

  it("handles 200% budget overrun without breaking compliance math", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildBudgetComplianceData({
      budget: budgetAt200User.budgets[0],
      transactions: budgetAt200User.transactions,
      currency: "NGN"
    });

    expect(result.derived.percent_budget_used).toBe(200);
    expect(result.derived.compliance_status).toBe("EXCEEDED");
    expect(result.spending.total_spent).toBe(1000);

    vi.useRealTimers();
  });

  it("returns zero spending when there are no matching expenses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildBudgetComplianceData({
      budget: edgeCaseUsers.onlyIncome.budgets[0],
      transactions: edgeCaseUsers.onlyIncome.transactions,
      currency: "NGN"
    });

    expect(result.spending.total_spent).toBe(0);
    expect(result.derived.percent_budget_used).toBe(0);
    expect(result.derived.compliance_status).toBe("ON_TRACK");

    vi.useRealTimers();
  });

  it("keeps ON_TRACK when a budget exists but no spending occurred", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildBudgetComplianceData({
      budget: budgetNoSpendingUser.budgets[0],
      transactions: budgetNoSpendingUser.transactions,
      currency: "NGN"
    });

    expect(result.spending.total_spent).toBe(0);
    expect(result.derived.compliance_status).toBe("ON_TRACK");

    vi.useRealTimers();
  });

  it("does not create compliance objects when no budget exists", () => {
    const results = edgeCaseUsers.onlyExpenses.budgets.map(budget =>
      buildBudgetComplianceData(budget, edgeCaseUsers.onlyExpenses.transactions, edgeCaseUsers.onlyExpenses.currency)
    );

    expect(results).toEqual([]);
  });

  it("does not crash when spending exists but there is no matching budget", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    expect(() =>
      buildBudgetComplianceData({
        budget: budget({ id: "budget-travel", category: "Travel", amount: 300 }),
        transactions: edgeCaseUsers.onlyExpenses.transactions,
        currency: "NGN"
      })
    ).not.toThrow();

    const result = buildBudgetComplianceData({
      budget: budget({ id: "budget-travel", category: "Travel", amount: 300 }),
      transactions: edgeCaseUsers.onlyExpenses.transactions,
      currency: "NGN"
    });

    expect(result.spending.total_spent).toBe(0);
    expect(result.derived.compliance_status).toBe("ON_TRACK");

    vi.useRealTimers();
  });

  it("handles a deleted budget by removing that category from compliance evaluation", () => {
    const budgetsAfterDelete = exceedingBudgetsUser.budgets.filter(budget => budget.category !== "Food");
    const results = budgetsAfterDelete.map(budget =>
      buildBudgetComplianceData({
        budget, 
        transactions: exceedingBudgetsUser.transactions, 
        currency: "NGN"
      })
    );

    expect(results).toEqual([]);
  });

  it("evaluates multiple budgets independently", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const results = multipleBudgetUser.budgets.map(budget =>
      buildBudgetComplianceData({
        budget, 
        transactions: multipleBudgetUser.transactions, 
        currency: "NGN"
      })
    );

    expect(results).toHaveLength(3);
    expect(results.map(result => result.category)).toEqual(["Food", "Transport", "Shopping"]);
    results.forEach(result => expect(["ON_TRACK", "BORDERLINE"]).toContain(result.derived.compliance_status));

    vi.useRealTimers();
  });

  it("evaluates duplicate budgets independently using the current budget list order", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const duplicateBudgets = [
      budget({ id: "budget-food-strict", category: "Food", amount: 400 }),
      budget({ id: "budget-food-loose", category: "Food", amount: 800 }),
    ];
    const results = duplicateBudgets.map(budget =>
      buildBudgetComplianceData({
        budget, 
        transactions: exceedingBudgetsUser.transactions, 
        currency: "NGN"
      })
    );

    expect(results).toHaveLength(2);
    expect(results.map(result => result.budget.amount)).toEqual([400, 800]);
    expect(results[0].derived.percent_budget_used).toBeGreaterThan(results[1].derived.percent_budget_used);
    expect(results[0].derived.compliance_status).toBe("EXCEEDED");

    vi.useRealTimers();
  });

  it("does not count June spending against a future-month budget", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildBudgetComplianceData({
      budget: futureBudgetUser.budgets[0],
      transactions: futureBudgetUser.transactions,
      currency: "NGN"
    });

    expect(result.spending.total_spent).toBe(0);
    expect(result.time.is_current_month).toBe(false);

    vi.useRealTimers();
  });

  it("does not count current-month spending against a previous-month budget", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedSystemDate));

    const result = buildBudgetComplianceData({
      budget: previousMonthBudgetUser.budgets[0],
      transactions: previousMonthBudgetUser.transactions,
      currency: "NGN"
    });

    expect(result.spending.total_spent).toBe(650);
    expect(result.spending.transaction_count).toBe(1);
    expect(result.time.is_current_month).toBe(false);

    vi.useRealTimers();
  });
});
