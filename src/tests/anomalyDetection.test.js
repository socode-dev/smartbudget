import { describe, it, expect } from "vitest";
import { detectAnomalies } from "../ml/anomalyDetection";

describe("detect anomaly", () => {
  it("returns empty arry when no anomalies", () => {
    const transactions = [
      { category: "Food", amount: 130, date: "2025-09-17" },
      { category: "Food", amount: 135, date: "2025-08-17" },
      { category: "Food", amount: 124, date: "2025-07-17" },
    ];

    const result = detectAnomalies(transactions);

    expect(result).toEqual([]);
  });

  it("flags an obvious outlier", () => {
    const transactions = [
      { category: "Food", amount: 130, date: "2025-04-03" },
      { category: "Food", amount: 124, date: "2025-05-12" },
      { category: "Food", amount: 135, date: "2025-06-17" },
      { category: "Food", amount: 100, date: "2025-07-27" },
      { category: "Food", amount: 210, date: "2025-08-13" },
      { category: "Food", amount: 2100, date: "2025-09-27" },
    ];

    const result = detectAnomalies(transactions);

    const requiredKeys = [
      "id",
      "type",
      "message",
      "actionType",
      "actionText",
      "createdAt",
      "severity",
      "source",
      "confidence",
    ];

    expect(result).toHaveLength(1);
    requiredKeys.forEach((key) => {
      expect(result[0]).toHaveProperty(key);
    });
  });

  it("handles all equal values withou false positives", () => {
    const transactions = [
      { category: "Food", amount: 50, date: "2025-04-03" },
      { category: "Food", amount: 50, date: "2025-05-12" },
      { category: "Food", amount: 50, date: "2025-06-17" },
      { category: "Food", amount: 50, date: "2025-07-27" },
      { category: "Food", amount: 50, date: "2025-08-13" },
      { category: "Food", amount: 50, date: "2025-09-27" },
    ];

    const result = detectAnomalies(transactions);

    expect(result).toEqual([]);
  });

  it("handles arrays with fewer than 3 values", () => {
    const transactions = [
      { category: "Food", amount: 2100, date: "2025-09-27" },
    ];

    const result = detectAnomalies(transactions);

    expect(result).toEqual([]);
  });

  it("works with negative and zero transaction amount", () => {
    const transactions = [
      { category: "Food", amount: 0, date: "2025-04-03" },
      { category: "Food", amount: -124, date: "2025-05-12" },
      { category: "Food", amount: -135, date: "2025-06-17" },
      { category: "Food", amount: -100, date: "2025-07-27" },
      { category: "Food", amount: -210, date: "2025-08-13" },
      { category: "Food", amount: -2100, date: "2025-09-27" },
    ];

    const result = detectAnomalies(transactions);

    const requiredKeys = [
      "id",
      "type",
      "message",
      "actionType",
      "actionText",
      "createdAt",
      "severity",
      "source",
      "confidence",
    ];

    expect(result).toHaveLength(1);
    requiredKeys.forEach((key) => {
      expect(result[0]).toHaveProperty(key);
    });
  });
});
