import { expense, income, withUser } from "./helpers.js";
import { normalUser } from "./normal-user.js";
import { noIncomeUser } from "./no-income.js";

export const duplicateTransactionUser = withUser({
  ...normalUser,
  userId: "user-duplicate-transactions",
  transactions: [
    income({ id: "income-jun", amount: 3000, month: 6 }),
    expense({ id: "food-duplicate", category: "Food", amount: 80, month: 6, day: 10 }),
    expense({ id: "food-duplicate", category: "Food", amount: 80, month: 6, day: 10 }),
  ],
});

export const edgeCaseUsers = {
  emptyTransactions: withUser({ userId: "user-empty-transactions" }),
  
  onlyIncome: withUser({
    userId: "user-only-income",
    budgets: normalUser.budgets,
    transactions: [income({ id: "income-jun", amount: 4000, month: 6 })],
  }),
  
  onlyExpenses: withUser({
    userId: "user-only-expenses",
    budgets: [],
    transactions: noIncomeUser.transactions,
  }),

  invalidDates: withUser({
    userId: "user-invalid-dates",
    budgets: normalUser.budgets,
    transactions: [
      {
        id: "bad-date",
        name: "Food",
        category: "Food",
        categoryKey: "food:unknown",
        amount: 200,
        type: "expense",
        date: "not-a-date",
        description: "Invalid imported date",
        createdAt: { seconds: 0, nanoseconds: 0 },
      },
      {
        id: "missing-date",
        name: "Food",
        category: "Food",
        categoryKey: "food:unknown",
        amount: 150,
        type: "expense",
        description: "Missing imported date",
        createdAt: { seconds: 0, nanoseconds: 0 },
      },
    ],
  }),

  futureDates: withUser({
    userId: "user-future-dates",
    budgets: normalUser.budgets,
    transactions: [
      {
        id: "future-food",
        name: "Food",
        category: "Food",
        categoryKey: "food:unknown",
        amount: 200,
        type: "expense",
        date: "2030-01-10",
        description: "Future dated imported transaction",
        createdAt: { seconds: 1894266000, nanoseconds: 0 },
      },
    ],
  }),
};
