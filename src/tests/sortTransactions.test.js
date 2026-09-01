import { describe, expect, it } from "vitest";
import { sortTransactionsByDateTime } from "../utils/sortTransactions";

describe("sortTransactionsByDateTime", () => {
  it("sorts by transaction date latest first", () => {
    const result = sortTransactionsByDateTime([
      { id: "older", date: "2026-08-30", createdAt: 300 },
      { id: "newer", date: "2026-09-01", createdAt: 100 },
      { id: "middle", date: "2026-08-31", createdAt: 200 },
    ]);

    expect(result.map((transaction) => transaction.id)).toEqual([
      "newer",
      "middle",
      "older",
    ]);
  });

  it("uses createdAt as the same-day time tie-breaker", () => {
    const result = sortTransactionsByDateTime([
      { id: "morning", date: "2026-09-01", createdAt: 100 },
      { id: "evening", date: "2026-09-01", createdAt: 300 },
      { id: "afternoon", date: "2026-09-01", createdAt: 200 },
    ]);

    expect(result.map((transaction) => transaction.id)).toEqual([
      "evening",
      "afternoon",
      "morning",
    ]);
  });

  it("supports Firestore timestamp-like createdAt values", () => {
    const result = sortTransactionsByDateTime([
      {
        id: "first",
        date: "2026-09-01",
        createdAt: { seconds: 100, nanoseconds: 0 },
      },
      {
        id: "second",
        date: "2026-09-01",
        createdAt: { seconds: 100, nanoseconds: 500000000 },
      },
    ]);

    expect(result.map((transaction) => transaction.id)).toEqual([
      "second",
      "first",
    ]);
  });

  it("uses the time inside transaction date when present", () => {
    const result = sortTransactionsByDateTime([
      { id: "early", date: "2026-09-01T09:00:00.000Z", createdAt: 300 },
      { id: "late", date: "2026-09-01T18:00:00.000Z", createdAt: 100 },
    ]);

    expect(result.map((transaction) => transaction.id)).toEqual([
      "late",
      "early",
    ]);
  });

  it("does not mutate the original list", () => {
    const transactions = [
      { id: "first", date: "2026-08-30", createdAt: 100 },
      { id: "second", date: "2026-09-01", createdAt: 200 },
    ];

    sortTransactionsByDateTime(transactions);

    expect(transactions.map((transaction) => transaction.id)).toEqual([
      "first",
      "second",
    ]);
  });
});
