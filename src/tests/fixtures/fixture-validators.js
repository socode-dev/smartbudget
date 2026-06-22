import { expect } from "vitest";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CATEGORY_KEY_PATTERN = /^[a-z0-9-]+:unknown$/;

export const assertFinanceRecordSchema = record => {
  expect(record).toMatchObject({
    id: expect.any(String),
    name: expect.any(String),
    category: expect.any(String),
    categoryKey: expect.stringMatching(CATEGORY_KEY_PATTERN),
    amount: expect.any(Number),
    type: expect.stringMatching(/^(income|expense)$/),
    date: expect.stringMatching(DATE_PATTERN),
    description: expect.any(String),
    createdAt: expect.objectContaining({
      seconds: expect.any(Number),
      nanoseconds: expect.any(Number),
    }),
  });

  expect(record.name).toBe(record.category);
  if (record.type === "income") {
    expect(record.amount).toBeGreaterThan(0);
  } else {
    expect(record.amount).not.toBe(0);
  }
};

export const assertTransactionsChronological = transactions => {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  sorted.forEach((transaction, index) => {
    if (index === 0) return;
    expect(transaction.date.localeCompare(sorted[index - 1].date)).toBeGreaterThanOrEqual(0);
  });
};

export const assertIncomeBeforeExpensesInMonth = (transactions, month) => {
  const monthPrefix = `2026-${String(month).padStart(2, "0")}`;
  const monthTxs = transactions.filter(tx => tx.date.startsWith(monthPrefix));
  const firstIncome = monthTxs.find(tx => tx.type === "income");
  const firstExpense = monthTxs.find(tx => tx.type === "expense");

  if (firstIncome && firstExpense) {
    expect(firstIncome.date.localeCompare(firstExpense.date)).toBeLessThanOrEqual(0);
  }
};

export const assertRealisticBankPersona = user => {
  expect(user.currency).toBe("USD");
  expect(user.userId).toMatch(/^user-/);
  expect(user.transactions.length).toBeGreaterThan(0);

  user.transactions.forEach(assertFinanceRecordSchema);
  assertTransactionsChronological(user.transactions);

  const incomes = user.transactions.filter(tx => tx.type === "income");
  const expenses = user.transactions.filter(tx => tx.type === "expense");

  expect(incomes.length).toBeGreaterThan(0);
  expect(expenses.length).toBeGreaterThan(0);

  incomes.forEach(tx => expect(tx.amount).toBeGreaterThanOrEqual(1000));
  expenses.forEach(tx => expect(tx.amount).toBeGreaterThan(0));

  user.budgets?.forEach(budget => {
    assertFinanceRecordSchema(budget);
    expect(budget.type).toBe("expense");
    expect(budget.amount).toBeGreaterThanOrEqual(50);
  });
};

export const assertPromptSanitized = prompt => {
  expect(prompt).not.toMatch(/\bundefined\b/);
  expect(prompt).not.toMatch(/\bnull\b/);
  expect(prompt).not.toMatch(/\bNaN\b/);
};
