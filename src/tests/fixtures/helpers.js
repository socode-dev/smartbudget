import { generateCategoryKey } from "../../utils/generateKey.js";
import { getSnakeCaseValue } from "../../utils/snakeCaseValue.js";

export const fixedSystemDate = "2026-06-15T12:00:00.000Z";

export const monthDate = (month, day = 12) =>
  `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const createdAt = (month, day = 1) => ({
  seconds: Math.floor(new Date(`${monthDate(month, day)}T09:00:00.000Z`).getTime() / 1000),
  nanoseconds: 0,
});

const persistedFinanceRecord = ({
  id,
  category,
  amount,
  type,
  date,
  description = "",
}) => {
  const displayCategory = getSnakeCaseValue(category);

  return {
    id,
    name: displayCategory,
    category: displayCategory,
    categoryKey: generateCategoryKey(category, ""),
    amount,
    type,
    date,
    description,
    createdAt: createdAt(Number(date.slice(5, 7)), Number(date.slice(8, 10))),
  };
};

export const expense = ({ id, category, amount, month, day = 12, description }) =>
  persistedFinanceRecord({
    id,
    category,
    amount,
    type: "expense",
    date: monthDate(month, day),
    description,
  });

export const income = ({ id, amount, month, day = 1, category = "Salary", description = "Monthly income" }) =>
  persistedFinanceRecord({
    id,
    category,
    amount,
    type: "income",
    date: monthDate(month, day),
    description,
  });

export const budget = ({ id, category, amount, month = 6, day = 1, type = "expense", description = "" }) =>
  persistedFinanceRecord({
    id,
    category,
    amount,
    type,
    date: monthDate(month, day),
    description,
  });

export const withUser = ({ userId, currency = "USD", transactions = [], budgets = [] }) => ({
  userId,
  currency,
  transactions,
  budgets,
});
