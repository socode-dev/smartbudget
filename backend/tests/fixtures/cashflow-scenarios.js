import { expense, income, withUser } from "./helpers.js";

export const incomeAfterSpendingUser = withUser({
  userId: "user-income-after-spending",
  transactions: [
    expense({ id: "rent-jun", category: "Rent", amount: 1200, month: 6, day: 2 }),
    expense({ id: "food-jun", category: "Food", amount: 400, month: 6, day: 5 }),
    income({ id: "salary-jun", category: "Salary", amount: 3500, month: 6, day: 14 }),
  ],
});

export const multipleIncomeSourcesUser = withUser({
  userId: "user-multiple-income-sources",
  transactions: [
    income({ id: "salary-jun", category: "Salary", amount: 3000, month: 6, day: 1 }),
    income({ id: "freelance-jun", category: "Freelance", amount: 850, month: 6, day: 7 }),
    income({ id: "bonus-jun", category: "Bonus", amount: 500, month: 6, day: 12 }),
    expense({ id: "food-jun", category: "Food", amount: 700, month: 6, day: 12 }),
  ],
});

export const monthIsolationUser = withUser({
  userId: "user-month-isolation",
  transactions: [
    income({ id: "salary-may", amount: 4000, month: 5, day: 1 }),
    expense({ id: "shopping-may", category: "Shopping", amount: 3000, month: 5, day: 20 }),
    income({ id: "salary-jun", amount: 4000, month: 6, day: 1 }),
    expense({ id: "food-jun", category: "Food", amount: 400, month: 6, day: 10 }),
  ],
});
