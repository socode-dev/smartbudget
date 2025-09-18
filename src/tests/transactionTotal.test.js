import { describe, it, expect } from "vitest";
import { transactionTotal } from "../utils/transactionTotal";

describe("transactionTotal", () => {
  it("calculates totals correctly for mixed transaction types", () => {
    const transactions = [
      { type: "income", amount: 1000 },
      { type: "income", amount: 500 },
      { type: "expense", amount: 200 },
      { type: "expense", amount: 150 },
      { type: "income", amount: 300 },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(1800);
    expect(result.totalExpenses).toBe(350);
    expect(result.totalBalance).toBe(2150);
  });

  it("handles only income transactions", () => {
    const transactions = [
      { type: "income", amount: 1000 },
      { type: "income", amount: 500 },
      { type: "income", amount: 300 },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(1800);
    expect(result.totalExpenses).toBe(0);
    expect(result.totalBalance).toBe(1800);
  });

  it("handles only expense transactions", () => {
    const transactions = [
      { type: "expense", amount: 200 },
      { type: "expense", amount: 150 },
      { type: "expense", amount: 100 },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(450);
    expect(result.totalBalance).toBe(450);
  });

  it("handles empty transactions array", () => {
    const transactions = [];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.totalBalance).toBe(0);
  });

  it("handles string amounts by converting to numbers", () => {
    const transactions = [
      { type: "income", amount: "1000" },
      { type: "expense", amount: "200" },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpenses).toBe(200);
    expect(result.totalBalance).toBe(1200);
  });

  it("handles decimal amounts", () => {
    const transactions = [
      { type: "income", amount: 1000.5 },
      { type: "expense", amount: 200.25 },
      { type: "income", amount: 99.75 },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(1100.25);
    expect(result.totalExpenses).toBe(200.25);
    expect(result.totalBalance).toBe(1300.5);
  });

  it("handles negative amounts", () => {
    const transactions = [
      { type: "income", amount: 1000 },
      { type: "expense", amount: -200 },
      { type: "income", amount: -100 },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(900);
    expect(result.totalExpenses).toBe(-200);
    expect(result.totalBalance).toBe(700);
  });

  it("handles zero amounts", () => {
    const transactions = [
      { type: "income", amount: 0 },
      { type: "expense", amount: 0 },
      { type: "income", amount: 100 },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(100);
    expect(result.totalExpenses).toBe(0);
    expect(result.totalBalance).toBe(100);
  });

  it("handles very large numbers", () => {
    const transactions = [
      { type: "income", amount: 987654321 },
      { type: "expense", amount: 123456789 },
    ];

    const result = transactionTotal(transactions);

    expect(result.totalIncome).toBe(987654321);
    expect(result.totalExpenses).toBe(123456789);
    expect(result.totalBalance).toBe(1111111110);
  });
});
