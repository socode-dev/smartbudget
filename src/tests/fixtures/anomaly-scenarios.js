import { expense, income, withUser } from "./helpers.js";

export const steadySpendingUser = withUser({
  userId: "user-steady-spending",
  transactions: [
    income({ id: "income-jan", amount: 4200, month: 1 }),
    income({ id: "income-feb", amount: 4200, month: 2 }),
    income({ id: "income-mar", amount: 4200, month: 3 }),
    income({ id: "income-apr", amount: 4200, month: 4 }),
    income({ id: "income-may", amount: 4200, month: 5 }),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jan", category: "Food", amount: 501, month: 1 }),
    expense({ id: "food-feb", category: "Food", amount: 499, month: 2 }),
    expense({ id: "food-mar", category: "Food", amount: 500, month: 3 }),
    expense({ id: "food-apr", category: "Food", amount: 502, month: 4 }),
    expense({ id: "food-may", category: "Food", amount: 498, month: 5 }),
    expense({ id: "food-jun", category: "Food", amount: 501, month: 6 }),
  ],
});

export const limitedHistoryUser = withUser({
  userId: "user-limited-history",
  transactions: [
    income({ id: "income-may", categoryKey: "freelance:unknown", category: "Freelance", amount: 4200, month: 5 }),
    income({ id: "income-jun", categoryKey: "salary:unknown", category: "Salary", amount: 4200, month: 6 }),
    expense({ id: "food-may", categoryKey: "food:unknown", category: "Food", amount: 500, month: 5 }),
    expense({ id: "food-jun", categoryKey: "food:unknown", category: "Food", amount: 1200, month: 6 }),
  ],
});

export const persistentSpikeUser = withUser({
  userId: "user-persistent-spike",
  transactions: [
    income({ id: "income-jan", categoryKey: "salary:unknown", category: "Salary", amount: 5000, month: 1 }),
    income({ id: "income-feb", categoryKey: "salary:unknown", category: "Salary", amount: 5000, month: 2 }),
    income({ id: "income-mar", categoryKey: "salary:unknown", category: "Salary", amount: 5000, month: 3 }),
    income({ id: "income-apr", categoryKey: "salary:unknown", category: "Salary", amount: 5000, month: 4 }),
    income({ id: "income-may", categoryKey: "salary:unknown", category: "Salary", amount: 5000, month: 5 }),
    income({ id: "income-jun", categoryKey: "salary:unknown", category: "Salary", amount: 5000, month: 6 }),
    expense({ id: "shopping-jan", categoryKey: "shopping:unknown", category: "Shopping", amount: 200, month: 1 }),
    expense({ id: "shopping-feb", categoryKey: "shopping:unknown", category: "Shopping", amount: 210, month: 2 }),
    expense({ id: "shopping-mar", categoryKey: "shopping:unknown", category: "Shopping", amount: 900, month: 3 }),
    expense({ id: "shopping-apr", categoryKey: "shopping:unknown", category: "Shopping", amount: 920, month: 4 }),
    expense({ id: "shopping-may", categoryKey: "shopping:unknown", category: "Shopping", amount: 910, month: 5 }),
    expense({ id: "shopping-jun", categoryKey: "shopping:unknown", category: "Shopping", amount: 915, month: 6 }),
  ],
});
