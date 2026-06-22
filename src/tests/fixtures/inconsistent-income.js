import { expense, income, withUser } from "./helpers.js";
import { normalUser } from "./normal-user.js";

export const inconsistentIncomeUser = withUser({
  ...normalUser,
  userId: "user-inconsistent-income",
  transactions: [
    income({ id: "income-feb", amount: 2800, month: 2, description: "Contract payment" }),
    income({ id: "income-apr", amount: 4300, month: 4, description: "Contract payment" }),
    income({ id: "income-jun", amount: 1600, month: 6, description: "Partial contract payment" }),
    expense({ id: "food-jun", category: "Food", amount: 650, month: 6 }),
    expense({ id: "rent-jun", category: "Rent", amount: 1100, month: 6 }),
  ],
});
