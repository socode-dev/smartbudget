import { describe, it, expect } from "vitest";
import { getForecastSeverity } from "../ml/getForecastSeverity";

describe("getForecastSeverity", () => {
  it("returns 'low' when budget is null or undefined", () => {
    expect(getForecastSeverity(100, null)).toBe("low");
    expect(getForecastSeverity(100, undefined)).toBe("low");
  });

  it("returns 'low' when budget is zero or negative", () => {
    expect(getForecastSeverity(100, 0)).toBe("low");
    expect(getForecastSeverity(100, -50)).toBe("low");
  });

  it("returns 'low' when predicted is significantly under budget", () => {
    expect(getForecastSeverity(50, 100)).toBe("low"); // 0.5 ratio
    expect(getForecastSeverity(70, 100)).toBe("low"); // 0.7 ratio
    expect(getForecastSeverity(79, 100)).toBe("low"); // 0.79 ratio
  });

  it("returns 'medium' when predicted is close to budget", () => {
    expect(getForecastSeverity(80, 100)).toBe("medium"); // 0.8 ratio
    expect(getForecastSeverity(90, 100)).toBe("medium"); // 0.9 ratio
    expect(getForecastSeverity(99, 100)).toBe("medium"); // 0.99 ratio
  });

  it("returns 'high' when predicted exceeds budget", () => {
    expect(getForecastSeverity(100, 100)).toBe("high"); // 1.0 ratio
    expect(getForecastSeverity(110, 100)).toBe("high"); // 1.1 ratio
    expect(getForecastSeverity(150, 100)).toBe("high"); // 1.5 ratio
  });

  it("handles decimal values correctly", () => {
    expect(getForecastSeverity(79.9, 100)).toBe("low"); // 0.799 ratio
    expect(getForecastSeverity(80.1, 100)).toBe("medium"); // 0.801 ratio
    expect(getForecastSeverity(100.1, 100)).toBe("high"); // 1.001 ratio
  });

  it("handles very large numbers", () => {
    expect(getForecastSeverity(600000, 1000000)).toBe("low"); // 0.8 ratio
    expect(getForecastSeverity(900000, 1000000)).toBe("medium"); // 0.9 ratio
    expect(getForecastSeverity(1200000, 1000000)).toBe("high"); // 1.2 ratio
  });

  it("handles very small numbers", () => {
    expect(getForecastSeverity(0.6, 1)).toBe("low"); // 0.8 ratio
    expect(getForecastSeverity(0.9, 1)).toBe("medium"); // 0.9 ratio
    expect(getForecastSeverity(1.1, 1)).toBe("high"); // 1.1 ratio
  });

  it("handles zero predicted value", () => {
    expect(getForecastSeverity(0, 100)).toBe("low"); // 0 ratio
  });

  it("handles negative predicted value", () => {
    expect(getForecastSeverity(-50, 100)).toBe("low"); // -0.5 ratio
  });
});
