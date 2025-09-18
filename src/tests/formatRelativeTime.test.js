import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "../utils/formatRelativeTime";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("return 'less than a minute ago' for current time", () => {
    const now = new Date("2025-09-09T12:00:00Z");
    vi.setSystemTime(now);

    expect(formatRelativeTime(now)).toBe("less than a minute ago");
  });

  it("returns empty string for null or undefined input", () => {
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime(undefined)).toBe("");
  });

  it("handles Date objects", () => {
    const oneWeekAgo = new Date("2025-01-08T12:00:00Z");

    expect(formatRelativeTime(oneWeekAgo)).toBe("7 days ago");
  });

  it("handles ISO string dates", () => {
    const oneDayAgo = "2025-01-14T12:00:00Z";

    expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");
  });

  it("handles numeric timestamps (milliseconds)", () => {
    const oneHourAgo = new Date("2025-01-15T11:00:00Z").getTime();

    expect(formatRelativeTime(oneHourAgo)).toBe("about 1 hour ago");
  });

  it("handles Firestore timestamp objects with seconds property", () => {
    const oneDayAgo = {
      seconds: Math.floor(new Date("2025-01-14T12:00:00Z").getTime() / 1000),
    };

    expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");
  });

  it("returns empty string for invalid dates", () => {
    expect(formatRelativeTime("invalid-date")).toBe("");
    expect(formatRelativeTime({})).toBe("");
    expect(formatRelativeTime([])).toBe("");
  });

  it("returns empty string for NaN dates", () => {
    const invalidDate = new Date("invalid");
    expect(formatRelativeTime(invalidDate)).toBe("");
  });

  it("handles future dates", () => {
    const oneDayFromNow = new Date("2025-01-16T12:00:00Z");

    expect(formatRelativeTime(oneDayFromNow)).toBe("in 1 day");
  });

  it("handles edge cases with different time zones", () => {
    const utcDate = "2025-01-15T11:00:00Z";

    expect(formatRelativeTime(utcDate)).toBe("about 1 hour ago");
  });

  it("handles objects that look like dates but aren't", () => {
    const fakeDate = {
      getTime: () => NaN,
    };

    expect(formatRelativeTime(fakeDate)).toBe("");
  });

  it("handles empty string", () => {
    expect(formatRelativeTime("")).toBe("");
  });

  it("handles negative timestamps", () => {
    const negativeTimestamp = -86400000; // 1 day before Unix epoch
    expect(formatRelativeTime(negativeTimestamp)).toBe("about 55 years ago");
  });
});
