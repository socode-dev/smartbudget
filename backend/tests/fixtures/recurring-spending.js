import { expense, income, withUser } from "./helpers.js";
import { normalUser } from "./normal-user.js";

export const recurringSpendingUser = withUser({
  ...normalUser,
  userId: "user-recurring-spending-spikes",
  transactions: [
    income({ id: "income-jan", amount: 4200, month: 1 }),
    income({ id: "income-feb", amount: 4200, month: 2 }),
    income({ id: "income-mar", amount: 4200, month: 3 }),
    income({ id: "income-apr", amount: 4200, month: 4 }),
    income({ id: "income-may", amount: 4200, month: 5 }),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "subscriptions-jan", category: "Entertainment", amount: 120, month: 1, description: "Streaming and events" }),
    expense({ id: "subscriptions-feb", category: "Entertainment", amount: 125, month: 2, description: "Streaming and events" }),
    expense({ id: "subscriptions-mar", category: "Entertainment", amount: 260, month: 3, description: "Concert tickets" }),
    expense({ id: "subscriptions-apr", category: "Entertainment", amount: 280, month: 4, description: "Weekend events" }),
    expense({ id: "subscriptions-may", category: "Entertainment", amount: 300, month: 5, description: "Games and events" }),
    expense({ id: "subscriptions-jun", category: "Entertainment", amount: 360, month: 6, description: "Events and subscriptions" }),
  ],
});
