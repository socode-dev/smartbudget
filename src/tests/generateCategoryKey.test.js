import { describe, it, expect } from "vitest";
import { generateCategoryKey } from "../utils/generateKey";

describe("generateCategoryKey", () => {
  it("generates correct key for simple category names", () => {
    expect(generateCategoryKey("budget", "Food")).toBe("budget:food");
    expect(generateCategoryKey("budget", "Transportation")).toBe(
      "budget:transportation"
    );
    expect(generateCategoryKey("budget", "Entertainment")).toBe(
      "budget:entertainment"
    );
  });

  it("handles category names with multiple spaces", () => {
    expect(generateCategoryKey("budget", "Food & Dining")).toBe(
      "budget:food-&-dining"
    );
    expect(generateCategoryKey("budget", "Health & Fitness")).toBe(
      "budget:health-&-fitness"
    );
    expect(generateCategoryKey("budget", "Home & Garden")).toBe(
      "budget:home-&-garden"
    );
  });

  it("handles category names with special characters", () => {
    expect(generateCategoryKey("budget", "Food & Dining")).toBe(
      "budget:food-&-dining"
    );
    expect(generateCategoryKey("budget", "Travel & Leisure")).toBe(
      "budget:travel-&-leisure"
    );
    expect(generateCategoryKey("budget", "Shopping & Retail")).toBe(
      "budget:shopping-&-retail"
    );
  });

  it("handles category names with numbers", () => {
    expect(generateCategoryKey("budget", "Category 1")).toBe(
      "budget:category-1"
    );
    expect(generateCategoryKey("budget", "Test 123")).toBe("budget:test-123");
    expect(generateCategoryKey("budget", "Item 2A")).toBe("budget:item-2a");
  });

  it("handles different prefix types", () => {
    expect(generateCategoryKey("BUDGET", "Food")).toBe("budget:food");
    expect(generateCategoryKey("Budget", "Food")).toBe("budget:food");
    expect(generateCategoryKey("BUDGET", "Food")).toBe("budget:food");
    expect(generateCategoryKey("transaction", "Food")).toBe("transaction:food");
    expect(generateCategoryKey("category", "Food")).toBe("category:food");
  });

  it("handles empty category names", () => {
    expect(generateCategoryKey("budget", "")).toBe("budget:unknown");
    expect(generateCategoryKey("budget", "   ")).toBe("budget:unknown");
  });

  it("handles null or undefined category names", () => {
    expect(generateCategoryKey("budget", null)).toBe("budget:unknown");
    expect(generateCategoryKey("budget", undefined)).toBe("budget:unknown");
  });

  it("handles null or undefined prefixes", () => {
    expect(generateCategoryKey(null, "Food")).toBe(":food");
    expect(generateCategoryKey(undefined, "Food")).toBe(":food");
  });

  it("handles category names with leading/trailing spaces", () => {
    expect(generateCategoryKey("budget", "  Food  ")).toBe("budget:food");
    expect(generateCategoryKey("budget", "   Transportation   ")).toBe(
      "budget:transportation"
    );
  });

  it("handles category names with consecutive spaces", () => {
    expect(generateCategoryKey("budget", "Food    &    Dining")).toBe(
      "budget:food-&-dining"
    );
    expect(generateCategoryKey("budget", "Health    &    Fitness")).toBe(
      "budget:health-&-fitness"
    );
  });

  it("handles category names with tabs and newlines", () => {
    expect(generateCategoryKey("budget", "Food\t& Dining")).toBe(
      "budget:food-&-dining"
    );
    expect(generateCategoryKey("budget", "Food\n& Dining")).toBe(
      "budget:food-&-dining"
    );
    expect(generateCategoryKey("budget", "Food\r\n& Dining")).toBe(
      "budget:food-&-dining"
    );
  });

  it("handles very long category names", () => {
    const longName =
      "This is a very long category name with many words and spaces";
    expect(generateCategoryKey("budget", longName)).toBe(
      "budget:this-is-a-very-long-category-name-with-many-words-and-spaces"
    );
  });

  it("handles category names with mixed case", () => {
    expect(generateCategoryKey("budget", "FOOD")).toBe("budget:food");
    expect(generateCategoryKey("budget", "Food")).toBe("budget:food");
    expect(generateCategoryKey("budget", "fOoD")).toBe("budget:food");
  });

  it("handles category names with punctuation", () => {
    expect(generateCategoryKey("budget", "Food & Dining!")).toBe(
      "budget:food-&-dining!"
    );
    expect(generateCategoryKey("budget", "Health & Fitness?")).toBe(
      "budget:health-&-fitness?"
    );
    expect(generateCategoryKey("budget", "Shopping & Retail.")).toBe(
      "budget:shopping-&-retail."
    );
  });

  it("handles category names with hyphens already present", () => {
    expect(generateCategoryKey("budget", "Food-Dining")).toBe(
      "budget:food-dining"
    );
    expect(generateCategoryKey("budget", "Health-Fitness")).toBe(
      "budget:health-fitness"
    );
  });

  it("handles single character category names", () => {
    expect(generateCategoryKey("budget", "A")).toBe("budget:a");
    expect(generateCategoryKey("budget", "1")).toBe("budget:1");
  });
});
