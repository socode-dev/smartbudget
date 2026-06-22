import { expense, withUser } from "./helpers.js";
import { normalUser } from "./normal-user.js";

export const noIncomeUser = withUser({
  ...normalUser,
  userId: "user-no-income",
  transactions: [
    expense({ id: "food-jun", category: "Food", amount: 300, month: 6, description: "Groceries" }),
    expense({ id: "transport-jun", category: "Transport", amount: 120, month: 6, description: "Transport fares" }),
  ],
});
