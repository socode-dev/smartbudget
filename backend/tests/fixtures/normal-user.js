import { budget, expense, income, withUser } from "./helpers.js";

export const normalUser = withUser({
  userId: "user-normal-spending",
  budgets: [
    budget({ id: "budget-food-jun", category: "Food", amount: 700, description: "Monthly food limit" }),
    budget({ id: "budget-transport-jun", category: "Transport", amount: 250, description: "Commute limit" }),
  ],
  transactions: [
    income({ id: "income-jan", amount: 4200, month: 1 }),
    expense({ id: "food-jan", category: "Food", amount: 510, month: 1, description: "Groceries and meals" }),
    income({ id: "income-feb", amount: 4200, month: 2 }),
    expense({ id: "food-feb", category: "Food", amount: 530, month: 2, description: "Groceries and meals" }),
    income({ id: "income-mar", amount: 4200, month: 3 }),
    expense({ id: "food-mar", category: "Food", amount: 520, month: 3, description: "Groceries and meals" }),
    income({ id: "income-apr", amount: 4200, month: 4 }),
    expense({ id: "food-apr", category: "Food", amount: 540, month: 4, description: "Groceries and meals" }),
    income({ id: "income-may", amount: 4200, month: 5 }),
    expense({ id: "food-may", category: "Food", amount: 525, month: 5, description: "Groceries and meals" }),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun", category: "Food", amount: 410, month: 6, description: "Groceries and meals" }),
    expense({ id: "transport-jun", category: "Transport", amount: 120, month: 6, description: "Bus and rideshare" }),
  ],
});
