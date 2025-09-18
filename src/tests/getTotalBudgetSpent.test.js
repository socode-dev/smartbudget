import { describe, it, expect } from "vitest";
import { getTotalBudgetSpent } from "../utils/getTotalBudgetSpent";

describe("getTotalBudgetSpent", () => {
  const mockTransactions = [
    {
      categoryKey: "budget:food",
      amount: 100,
      date: "2025-01-15",
      type: "expense",
    },
    {
      categoryKey: "budget:transportation",
      amount: 50,
      date: "2025-01-16",
      type: "expense",
    },
    {
      categoryKey: "budget:food",
      amount: 75,
      date: "2025-01-17",
      type: "expense",
    },
  ];

  const mockBudgets = [
    {
      categoryKey: "budget:food",
      amount: 300,
      date: "2025-01-01",
      type: "expense",
    },
    {
      categoryKey: "budget:transportation",
      amount: 200,
      date: "2025-01-01",
      type: "expense",
    },
  ];

  it("calculates total spent for matching budget categories in same month", () => {
    const result = getTotalBudgetSpent(
      mockTransactions,
      mockBudgets,
      "expense"
    );

    expect(result).toBe(225);
  });

  it("returns 0 when no matching transactions found", () => {
    const differentMonthTransactions = [
      {
        categoryKey: "budget:food",
        amount: 100,
        date: "2025-03-15", // Different month
        type: "expense",
      },
    ];

    const result = getTotalBudgetSpent(
      differentMonthTransactions,
      mockBudgets,
      "expense"
    );
    expect(result).toBe(0);
  });

  it("returns 0 when no matching budget categories found", () => {
    const differentCategoryTransactions = [
      {
        categoryKey: "budget:clothing",
        amount: 100,
        date: "2025-01-15",
        type: "expense",
      },
    ];

    const result = getTotalBudgetSpent(
      differentCategoryTransactions,
      mockBudgets,
      "expense"
    );
    expect(result).toBe(0);
  });

  it("handles empty transactions array", () => {
    const result = getTotalBudgetSpent([], mockBudgets, "expense");
    expect(result).toBe(0);
  });

  it("handles empty budgets array", () => {
    const result = getTotalBudgetSpent(mockTransactions, [], "expense");
    expect(result).toBe(0);
  });

  it("filters by transaction type correctly", () => {
    const mixedTypeTransactions = [
      {
        categoryKey: "budget:food",
        amount: 100,
        date: "2025-01-15",
        type: "expense",
      },
      {
        categoryKey: "budget:food",
        amount: 50,
        date: "2025-01-16",
        type: "income", // Different type
      },
    ];

    const result = getTotalBudgetSpent(
      mixedTypeTransactions,
      mockBudgets,
      "expense"
    );
    expect(result).toBe(100);
  });

  it("handles different budget types", () => {
    const incomeBudgets = [
      {
        categoryKey: "budget:salary",
        amount: 5000,
        date: "2025-01-01",
        type: "income",
      },
    ];

    const incomeTransactions = [
      {
        categoryKey: "budget:salary",
        amount: 5000,
        date: "2025-01-15",
        type: "income",
      },
    ];

    const result = getTotalBudgetSpent(
      incomeTransactions,
      incomeBudgets,
      "income"
    );
    expect(result).toBe(5000);
  });

  it("handles transactions with decimal amounts", () => {
    const decimalTransactions = [
      {
        categoryKey: "budget:food",
        amount: 99.99,
        date: "2025-01-15",
        type: "expense",
      },
      {
        categoryKey: "budget:food",
        amount: 0.01,
        date: "2025-01-16",
        type: "expense",
      },
    ];

    const result = getTotalBudgetSpent(
      decimalTransactions,
      mockBudgets,
      "expense"
    );
    expect(result).toBe(100);
  });

  it("handles transactions with negative amounts", () => {
    const negativeTransactions = [
      {
        categoryKey: "budget:food",
        amount: 100,
        date: "2025-01-15",
        type: "expense",
      },
      {
        categoryKey: "budget:food",
        amount: -25, // Refund
        date: "2025-01-16",
        type: "expense",
      },
    ];

    const result = getTotalBudgetSpent(
      negativeTransactions,
      mockBudgets,
      "expense"
    );
    expect(result).toBe(75);
  });

  it("handles multiple transactions for same category in same month", () => {
    const multipleTransactions = [
      {
        categoryKey: "budget:food",
        amount: 50,
        date: "2025-01-15",
        type: "expense",
      },
      {
        categoryKey: "budget:food",
        amount: 75,
        date: "2025-01-20",
        type: "expense",
      },
      {
        categoryKey: "budget:food",
        amount: 25,
        date: "2025-01-25",
        type: "expense",
      },
    ];

    const result = getTotalBudgetSpent(
      multipleTransactions,
      mockBudgets,
      "expense"
    );
    expect(result).toBe(150);
  });

  it("handles case sensitivity in category keys", () => {
    const caseSensitiveTransactions = [
      {
        categoryKey: "BUDGET:FOOD", // Different case
        amount: 100,
        date: "2025-01-15",
        type: "expense",
      },
    ];

    const result = getTotalBudgetSpent(
      caseSensitiveTransactions,
      mockBudgets,
      "expense"
    );
    expect(result).toBe(0);
  });
});
