import { budget, expense, income, withUser } from "./helpers.js";

export const exceedingBudgetsUser = withUser({
  userId: "user-exceeding-budgets",
  budgets: [
    budget({ id: "budget-food-jun", category: "Food", amount: 500, description: "Food cap for June" }),
  ],
  transactions: [
    income({ id: "income-jun", amount: 4000, month: 6 }),
    expense({ id: "food-jun-1", category: "Food", amount: 350, month: 6, day: 5, description: "Weekly groceries" }),
    expense({ id: "food-jun-2", category: "Food", amount: 150, month: 6, day: 12, description: "Takeout and groceries" }),
  ],
});
