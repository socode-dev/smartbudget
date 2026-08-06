import { budget, expense, income, withUser } from "./helpers.js";

export const pipelineCustomer = withUser({
  userId: "user-full-pipeline",
  budgets: [
    budget({ id: "budget-food-jun", category: "Food", amount: 650 }),
    budget({ id: "budget-shopping-jun", category: "Shopping", amount: 400 }),
  ],
  transactions: [
    income({ id: "income-jan", amount: 4500, month: 1 }),
    income({ id: "income-feb", amount: 4500, month: 2 }),
    income({ id: "income-mar", amount: 4500, month: 3 }),
    income({ id: "income-apr", amount: 4500, month: 4 }),
    income({ id: "income-may", amount: 4500, month: 5 }),
    income({ id: "income-jun", amount: 4500, month: 6 }),
    expense({ id: "food-jan", category: "Food", amount: 500, month: 1 }),
    expense({ id: "food-feb", category: "Food", amount: 510, month: 2 }),
    expense({ id: "food-mar", category: "Food", amount: 520, month: 3 }),
    expense({ id: "food-apr", category: "Food", amount: 700, month: 4 }),
    expense({ id: "food-may", category: "Food", amount: 850, month: 5 }),
    expense({ id: "food-jun", category: "Food", amount: 1400, month: 6, day: 11 }),
    expense({ id: "shopping-jan", category: "Shopping", amount: 210, month: 1 }),
    expense({ id: "shopping-feb", category: "Shopping", amount: 205, month: 2 }),
    expense({ id: "shopping-mar", category: "Shopping", amount: 215, month: 3 }),
    expense({ id: "shopping-apr", category: "Shopping", amount: 450, month: 4 }),
    expense({ id: "shopping-may", category: "Shopping", amount: 620, month: 5 }),
    expense({ id: "shopping-jun", category: "Shopping", amount: 1000, month: 6, day: 12 }),
    expense({ id: "rent-jun", category: "Rent", amount: 1800, month: 6, day: 2 }),
    expense({ id: "transport-jun", category: "Transport", amount: 350, month: 6, day: 8 }),
  ],
});
