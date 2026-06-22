import { budget, expense, income, withUser } from "./helpers.js";

const CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Rent",
  "Entertainment",
  "Health",
  "Utilities",
  "Travel",
  "Education",
  "Insurance",
];

export const buildMultiCategorySpikeUser = categoryCount => {
  const categories = CATEGORIES.slice(0, categoryCount);
  const transactions = [];

  for (let month = 1; month <= 6; month += 1) {
    transactions.push(income({ id: `salary-${month}`, amount: 5000, month, day: 1 }));

    categories.forEach((category, index) => {
      const baseline = 200 + index * 40;
      const amount = month === 6 ? baseline * 2.8 : baseline;

      transactions.push(
        expense({
          id: `${category.toLowerCase()}-${month}`,
          category,
          amount: Math.round(amount),
          month,
          day: month === 6 ? 10 : 12,
        })
      );
    });
  }

  return withUser({
    userId: `user-multi-spike-${categoryCount}`,
    transactions,
  });
};

export const newCategoryUser = withUser({
  userId: "user-new-category",
  transactions: [
    income({ id: "income-jan", amount: 4200, month: 1 }),
    income({ id: "income-feb", amount: 4200, month: 2 }),
    income({ id: "income-mar", amount: 4200, month: 3 }),
    income({ id: "income-apr", amount: 4200, month: 4 }),
    income({ id: "income-may", amount: 4200, month: 5 }),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jan", category: "Food", amount: 500, month: 1 }),
    expense({ id: "food-feb", category: "Food", amount: 500, month: 2 }),
    expense({ id: "food-mar", category: "Food", amount: 500, month: 3 }),
    expense({ id: "food-apr", category: "Food", amount: 500, month: 4 }),
    expense({ id: "food-may", category: "Food", amount: 500, month: 5 }),
    expense({ id: "food-jun", category: "Food", amount: 500, month: 6 }),
    expense({ id: "gadgets-jun", category: "Gadgets", amount: 800, month: 6, day: 14, description: "First purchase in new category" }),
  ],
});

export const refundUser = withUser({
  userId: "user-refunds",
  transactions: [
    income({ id: "income-jan", amount: 4200, month: 1 }),
    income({ id: "income-feb", amount: 4200, month: 2 }),
    income({ id: "income-mar", amount: 4200, month: 3 }),
    income({ id: "income-apr", amount: 4200, month: 4 }),
    income({ id: "income-may", amount: 4200, month: 5 }),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    ...[1, 2, 3, 4, 5].flatMap(month =>
      expense({ id: `shopping-${month}`, category: "Shopping", amount: 400, month })
    ),
    expense({ id: "shopping-jun-purchase", category: "Shopping", amount: 900, month: 6, day: 8 }),
    expense({ id: "shopping-jun-refund", category: "Shopping", amount: -500, month: 6, day: 9, description: "Returned item" }),
  ],
});

export const budgetAt99User = withUser({
  userId: "user-budget-99",
  budgets: [budget({ id: "budget-food-jun", category: "Food", amount: 1000, month: 6 })],
  transactions: [
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun", category: "Food", amount: 990, month: 6, day: 28 }),
  ],
});

export const budgetAt200User = withUser({
  userId: "user-budget-200",
  budgets: [budget({ id: "budget-food-jun", category: "Food", amount: 500, month: 6 })],
  transactions: [
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun-1", category: "Food", amount: 600, month: 6, day: 5 }),
    expense({ id: "food-jun-2", category: "Food", amount: 400, month: 6, day: 12 }),
  ],
});

export const budgetNoSpendingUser = withUser({
  userId: "user-budget-no-spending",
  budgets: [budget({ id: "budget-food-jun", category: "Food", amount: 700, month: 6 })],
  transactions: [income({ id: "income-jun", amount: 4200, month: 6 })],
});

export const multipleBudgetUser = withUser({
  userId: "user-multiple-budgets",
  budgets: [
    budget({ id: "budget-food-jun", category: "Food", amount: 700, month: 6 }),
    budget({ id: "budget-transport-jun", category: "Transport", amount: 250, month: 6 }),
    budget({ id: "budget-shopping-jun", category: "Shopping", amount: 300, month: 6 }),
  ],
  transactions: [
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun", category: "Food", amount: 350, month: 6 }),
    expense({ id: "transport-jun", category: "Transport", amount: 90, month: 6 }),
    expense({ id: "shopping-jun", category: "Shopping", amount: 120, month: 6 }),
  ],
});

export const futureBudgetUser = withUser({
  userId: "user-future-budget",
  budgets: [budget({ id: "budget-food-jul", category: "Food", amount: 700, month: 7, day: 1 })],
  transactions: [
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun", category: "Food", amount: 500, month: 6 }),
  ],
});

export const previousMonthBudgetUser = withUser({
  userId: "user-previous-month-budget",
  budgets: [budget({ id: "budget-food-may", category: "Food", amount: 700, month: 5 })],
  transactions: [
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun", category: "Food", amount: 500, month: 6 }),
    expense({ id: "food-may", category: "Food", amount: 650, month: 5 }),
  ],
});

export const cashflowBreakEvenUser = withUser({
  userId: "user-cashflow-breakeven",
  transactions: [
    income({ id: "income-jun", amount: 4000, month: 6, day: 1 }),
    expense({ id: "rent-jun", category: "Rent", amount: 1800, month: 6, day: 2 }),
    expense({ id: "food-jun", category: "Food", amount: 1200, month: 6, day: 8 }),
    expense({ id: "utilities-jun", category: "Utilities", amount: 1000, month: 6, day: 12 }),
  ],
});

export const cashflowWithFutureTransactionsUser = withUser({
  userId: "user-cashflow-future",
  transactions: [
    income({ id: "income-jun", amount: 4000, month: 6, day: 1 }),
    expense({ id: "food-jun", category: "Food", amount: 400, month: 6, day: 10 }),
    expense({ id: "food-jul", category: "Food", amount: 9999, month: 7, day: 1 }),
    income({ id: "income-jul", amount: 9999, month: 7, day: 1 }),
  ],
});

export const independentCategorySpikeUser = withUser({
  userId: "user-independent-spike",
  transactions: [
    income({ id: "income-jan", amount: 5000, month: 1 }),
    income({ id: "income-feb", amount: 5000, month: 2 }),
    income({ id: "income-mar", amount: 5000, month: 3 }),
    income({ id: "income-apr", amount: 5000, month: 4 }),
    income({ id: "income-may", amount: 5000, month: 5 }),
    income({ id: "income-jun", amount: 5000, month: 6 }),
    ...[1, 2, 3, 4, 5, 6].map(month => expense({ id: `food-${month}`, category: "Food", amount: month === 6 ? 1200 : 500, month })),
    ...[1, 2, 3, 4, 5, 6].map(month => expense({ id: `transport-${month}`, category: "Transport", amount: 120, month })),
    ...[1, 2, 3, 4, 5, 6].map(month => expense({ id: `shopping-${month}`, category: "Shopping", amount: 180, month })),
    ...[1, 2, 3, 4, 5, 6].map(month => expense({ id: `rent-${month}`, category: "Rent", amount: 1500, month, day: 1 })),
  ],
});

export const sparseHistoryTwoMonthUser = withUser({
  userId: "user-sparse-two-months",
  transactions: [
    income({ id: "income-may", amount: 4200, month: 5 }),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-may", category: "Food", amount: 500, month: 5 }),
    expense({ id: "food-jun", category: "Food", amount: 1500, month: 6 }),
  ],
});

export const mediumSeverityAnomalyUser = withUser({
  userId: "user-medium-anomaly",
  transactions: [
    income({ id: "income-jan", amount: 4200, month: 1 }),
    expense({ id: "food-jan", category: "Food", amount: 450, month: 1 }),
    income({ id: "income-feb", amount: 4200, month: 2 }),
    expense({ id: "food-feb", category: "Food", amount: 500, month: 2 }),
    income({ id: "income-mar", amount: 4200, month: 3 }),
    expense({ id: "food-mar", category: "Food", amount: 550, month: 3 }),
    income({ id: "income-apr", amount: 4200, month: 4 }),
    expense({ id: "food-apr", category: "Food", amount: 500, month: 4 }),
    income({ id: "income-may", amount: 4200, month: 5 }),
    expense({ id: "food-may", category: "Food", amount: 550, month: 5 }),
    income({ id: "income-jun", amount: 4200, month: 6 }),
    expense({ id: "food-jun", category: "Food", amount: 750, month: 6 }),
  ],
});
