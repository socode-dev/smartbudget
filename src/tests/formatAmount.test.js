import { describe, it, expect } from "vitest";
import { formatAmount } from "../utils/formatAmount";

describe("formatAmount", () => {
  it("formats USD amounts correctly", () => {
    expect(formatAmount(100, "USD")).toBe("$100.00");
    expect(formatAmount(1234.56, "USD")).toBe("$1,234.56");
    expect(formatAmount(0, "USD")).toBe("$0.00");
    expect(formatAmount(0.99, "USD")).toBe("$0.99");
  });

  it("formats EUR amounts correctly", () => {
    expect(formatAmount(100, "EUR")).toBe("€100.00");
    expect(formatAmount(1234.56, "EUR")).toBe("€1,234.56");
    expect(formatAmount(0, "EUR")).toBe("€0.00");
  });

  it("formats GBP amounts correctly", () => {
    expect(formatAmount(100, "GBP")).toBe("£100.00");
    expect(formatAmount(1234.56, "GBP")).toBe("£1,234.56");
    expect(formatAmount(0, "GBP")).toBe("£0.00");
  });

  it("handles negative amounts", () => {
    expect(formatAmount(-100, "USD")).toBe("-$100.00");
    expect(formatAmount(-1234.56, "USD")).toBe("-$1,234.56");
    expect(formatAmount(-0.99, "USD")).toBe("-$0.99");
  });

  it("handles very large numbers", () => {
    expect(formatAmount(1000000, "USD")).toBe("$1,000,000.00");
    expect(formatAmount(1234567.89, "USD")).toBe("$1,234,567.89");
    expect(formatAmount(999999999.99, "USD")).toBe("$999,999,999.99");
  });

  it("handles very small decimal amounts", () => {
    expect(formatAmount(0.01, "USD")).toBe("$0.01");
    expect(formatAmount(0.001, "USD")).toBe("$0.00"); // Rounds to 2 decimal places
    expect(formatAmount(0.005, "USD")).toBe("$0.01"); // Rounds up
  });

  it("handles zero amounts", () => {
    expect(formatAmount(0, "USD")).toBe("$0.00");
    expect(formatAmount(0, "EUR")).toBe("€0.00");
    expect(formatAmount(0, "GBP")).toBe("£0.00");
  });

  it("handles string amounts", () => {
    expect(formatAmount("100", "USD")).toBe("$100.00");
    expect(formatAmount("1234.56", "USD")).toBe("$1,234.56");
    expect(formatAmount("0", "USD")).toBe("$0.00");
  });

  it("handles null or undefined amounts", () => {
    expect(formatAmount(null, "USD")).toBe("$0.00");
    expect(formatAmount(undefined, "USD")).toBe("$0.00");
  });

  it("handles null or undefined currency", () => {
    expect(() => formatAmount(100, null)).toThrow();
    expect(() => formatAmount(100, undefined)).toThrow();
  });

  it("handles currencies with different decimal place conventions", () => {
    expect(formatAmount(123.45, "JPY")).toBe("¥123.45");
    expect(formatAmount(123.45, "USD")).toBe("$123.45");
  });
});
