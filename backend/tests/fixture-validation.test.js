import { describe, expect, it } from "vitest";
import {
  cashflowRiskUser,
  exceedingBudgetsUser,
  incomeAfterSpendingUser,
  multipleIncomeSourcesUser,
  normalUser,
  oneCategoryOverspendingUser,
  steadySpendingUser,
} from "./fixtures/index.js";
import {
  assertFinanceRecordSchema,
  assertIncomeBeforeExpensesInMonth,
  assertRealisticBankPersona,
  assertTransactionsChronological,
} from "./fixtures/fixture-validators.js";

describe("fixture trust", () => {
  it("models normalUser as a realistic bank customer", () => {
    assertRealisticBankPersona(normalUser);
    assertIncomeBeforeExpensesInMonth(normalUser.transactions, 6);

    const juneFood = normalUser.transactions.filter(
      tx => tx.type === "expense" && tx.category === "Food" && tx.date.startsWith("2026-06")
    );
    const historicalFood = normalUser.transactions.filter(
      tx => tx.type === "expense" && tx.category === "Food" && !tx.date.startsWith("2026-06")
    );

    expect(juneFood[0].amount).toBeLessThanOrEqual(Math.max(...historicalFood.map(tx => tx.amount)) + 50);
    expect(normalUser.budgets).toHaveLength(2);
    normalUser.budgets.forEach(budget => expect(budget.date.startsWith("2026-06")).toBe(true));
  });

  it("keeps cashflow personas ordered and schema-complete", () => {
    [cashflowRiskUser, multipleIncomeSourcesUser].forEach(user => {
      user.transactions.forEach(assertFinanceRecordSchema);
      assertTransactionsChronological(user.transactions);
    });

    incomeAfterSpendingUser.transactions.forEach(assertFinanceRecordSchema);
    assertTransactionsChronological(incomeAfterSpendingUser.transactions);

    const juneIncome = incomeAfterSpendingUser.transactions.find(tx => tx.type === "income");
    const juneExpenses = incomeAfterSpendingUser.transactions.filter(tx => tx.type === "expense");
    expect(juneExpenses.every(tx => tx.date < juneIncome.date)).toBe(true);
    expect(multipleIncomeSourcesUser.transactions.filter(tx => tx.type === "income")).toHaveLength(3);
  });

  it("keeps anomaly personas with stable baselines before June spikes", () => {
    assertRealisticBankPersona(oneCategoryOverspendingUser);
    assertRealisticBankPersona(steadySpendingUser);

    const steadyTotals = steadySpendingUser.transactions
      .filter(tx => tx.category === "Food" && tx.type === "expense")
      .map(tx => tx.amount);
    const maxDelta = Math.max(...steadyTotals) - Math.min(...steadyTotals);

    expect(maxDelta).toBeLessThanOrEqual(5);
  });

  it("keeps budget fixtures aligned with June spending windows", () => {
    exceedingBudgetsUser.budgets.forEach(budget => {
      assertFinanceRecordSchema(budget);
      expect(budget.categoryKey).toBe("food:unknown");
    });

    const foodSpend = exceedingBudgetsUser.transactions
      .filter(tx => tx.category === "Food" && tx.date.startsWith("2026-06"))
      .reduce((sum, tx) => sum + tx.amount, 0);

    expect(foodSpend).toBe(exceedingBudgetsUser.budgets[0].amount);
  });
});
