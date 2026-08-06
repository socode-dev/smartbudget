import { expense, income, withUser } from "./helpers.js";
import { normalUser } from "./normal-user.js";

export const cashflowRiskUser = withUser({
  ...normalUser,
  userId: "user-cashflow-risk",
  transactions: [
    income({ id: "income-jun", category: "Salary", amount: 4000, month: 6 }),
    expense({ id: "rent-jun", category: "Rent", amount: 1800, month: 6, day: 2, description: "Monthly rent" }),
    expense({ id: "food-jun", category: "Food", amount: 1200, month: 6, day: 8, description: "Groceries and meals" }),
    expense({ id: "shopping-jun", category: "Shopping", amount: 900, month: 6, day: 12, description: "Clothes and home items" }),
  ],
});
