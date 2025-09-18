import { describe, expect, it } from "vitest";
import { preprocessTransaction } from "../ml/preprocessTransactions";

describe("preprocessTransactions", () => {
  it("groups transactions by category + month", () => {
    const transactions = [
      {
        category: "Food",
        amount: 20,
        date: "2025-09-01",
      },
      {
        category: "Food",
        amount: 30,
        date: "2025-09-14",
      },
    ];
    const result = preprocessTransaction(transactions);

    expect(result).toHaveProperty("Food");
    expect(result.Food).toHaveLength(1);
    expect(result.Food[0]).toEqual({
      month: "2025-09",
      total: 50,
    });
  });

  it("sums amount correctly", () => {
    const transactions = [
      {
        category: "Food",
        amount: 30,
        date: "2025-09-14",
      },
      { category: "Phone", amount: 150, date: "2025-09-12" },
    ];

    const result = preprocessTransaction(transactions);

    expect(result.Food[0].total).toBe(30);
    expect(result.Phone[0].total).toBe(150);
  });

  it("handles multiple categories", () => {
    const transactions = [
      {
        category: "Food",
        amount: 20,
        date: "2025-09-01",
      },
      { category: "Phone", amount: 150, date: "2025-09-12" },
      { category: "Internet", amount: 32.65, date: "2025-09-17" },
    ];

    const result = preprocessTransaction(transactions);

    expect(result).toEqual({
      Food: [{ month: "2025-09", total: 20 }],
      Phone: [{ month: "2025-09", total: 150 }],
      Internet: [{ month: "2025-09", total: 32.65 }],
    });
  });

  it("handle multiple months", () => {
    const transactions = [
      { category: "Food", amount: 20, date: "2025-09-01" },
      { category: "Food", amount: 59, date: "2025-08-10" },
    ];

    const result = preprocessTransaction(transactions);

    expect(result.Food).toHaveLength(2);
    expect(result).toEqual({
      Food: [
        { month: "2025-08", total: 59 },
        { month: "2025-09", total: 20 },
      ],
    });
  });

  it("returns empty object when input is empty", () => {
    const transactions = [];

    const result = preprocessTransaction(transactions);

    expect(result).toEqual({});
  });
});
