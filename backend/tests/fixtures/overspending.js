import { budget, expense, income, withUser } from "./helpers.js";
import { normalUser } from "./normal-user.js";

const foodHistory = month =>
  expense({ id: `food-${month}`, category: "Food", amount: 500, month });

export const oneCategoryOverspendingUser = withUser({
  ...normalUser,
  userId: "user-one-category-overspending",
  transactions: [
    income({ id: "income-jan", amount: 4200, month: 1 }),
    foodHistory(1),
    income({ id: "income-feb", amount: 4200, month: 2 }),
    foodHistory(2),
    income({ id: "income-mar", amount: 4200, month: 3 }),
    foodHistory(3),
    income({ id: "income-apr", amount: 4200, month: 4 }),
    foodHistory(4),
    income({ id: "income-may", amount: 4200, month: 5 }),
    foodHistory(5),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun-spike", category: "Food", amount: 900, month: 6, description: "Several restaurant visits" }),
    expense({ id: "transport-jun", category: "Transport", amount: 120, month: 6, description: "Bus and rideshare" }),
  ],
});

export const threeCategoryOverspendingUser = withUser({
  ...normalUser,
  userId: "user-three-category-overspending",
  budgets: [
    ...normalUser.budgets,
    budget({ id: "budget-shopping-jun", category: "Shopping", amount: 300 }),
    budget({ id: "budget-entertainment-jun", category: "Entertainment", amount: 200 }),
  ],
  transactions: [
    ...[1, 2, 3, 4, 5, 6].flatMap(month => {
      const baseline = { Food: 500, Shopping: 180, Entertainment: 120 };
      const spike = { Food: 950, Shopping: 420, Entertainment: 320 };

      return [
        income({ id: `income-${month}`, amount: 4200, month }),
        ...["Food", "Shopping", "Entertainment"].map(category =>
          expense({
            id: `${category.toLowerCase()}-${month}${month === 6 ? "-spike" : ""}`,
            category,
            amount: month === 6 ? spike[category] : baseline[category],
            month,
          })
        ),
        ...(month === 6
          ? [expense({ id: "transport-jun", category: "Transport", amount: 120, month: 6, description: "Bus and rideshare" })]
          : []),
      ];
    }),
  ],
});
