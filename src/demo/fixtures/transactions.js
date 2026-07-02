const monthPatterns = [
  { month: 1, income: 3600, food: 520, transportation: 240, utilities: 180, rent: 900, healthcare: 90, shopping: 190, entertainment: 120 },
  { month: 2, income: 3600, food: 540, transportation: 260, utilities: 170, rent: 900, healthcare: 80, shopping: 210, entertainment: 140 },
  { month: 3, income: 3800, food: 570, transportation: 250, utilities: 190, rent: 900, healthcare: 120, shopping: 230, entertainment: 160 },
  { month: 4, income: 3400, food: 650, transportation: 310, utilities: 220, rent: 900, healthcare: 130, shopping: 320, entertainment: 220 },
  { month: 5, income: 3200, food: 760, transportation: 420, utilities: 240, rent: 900, healthcare: 160, shopping: 430, entertainment: 260 },
  { month: 6, income: 3200, food: 1120, transportation: 980, utilities: 260, rent: 900, healthcare: 210, shopping: 620, entertainment: 720 },
];

const expenseDefinitions = [
  ["Food", "food", "Market and household groceries", 5],
  ["Transportation", "transportation", "Work commute and branch visits", 8],
  ["Utilities", "utilities", "Power, water, and prepaid services", 10],
  ["Rent", "rent", "Monthly rent payment", 2],
  ["Healthcare", "healthcare", "Clinic and medication expenses", 14],
  ["Shopping", "shopping", "Household replacement purchases", 18],
  ["Entertainment", "entertainment", "Family events and subscriptions", 22],
];

export const demoTransactions = monthPatterns.flatMap((pattern) => {
  const year = 2026;
  const month = String(pattern.month).padStart(2, "0");
  const createdAtBase = new Date(`${year}-${month}-01T09:00:00`).getTime();

  const income = {
    id: `demo-income-${month}`,
    name: "Microenterprise Salary",
    description: "Monthly cooperative disbursement",
    category: "Salary",
    categoryKey: "txn:salary",
    type: "income",
    amount: pattern.income,
    date: `${year}-${month}-01`,
    createdAt: createdAtBase,
  };

  const bonus =
    pattern.month === 3
      ? [{
          id: "demo-income-03-bonus",
          name: "Market Stall Bonus",
          description: "Quarterly trading bonus",
          category: "Freelance",
          categoryKey: "txn:freelance",
          type: "income",
          amount: 450,
          date: "2026-03-27",
          createdAt: new Date("2026-03-27T09:00:00").getTime(),
        }]
      : [];

  const expenses = expenseDefinitions.map(([category, key, description, day]) => ({
    id: `demo-${key}-${month}`,
    name: category,
    description,
    category,
    categoryKey: `txn:${key}`,
    type: "expense",
    amount: pattern[key],
    date: `${year}-${month}-${String(day).padStart(2, "0")}`,
    createdAt: new Date(`${year}-${month}-${String(day).padStart(2, "0")}T12:00:00`).getTime(),
  }));

  return [income, ...bonus, ...expenses];
});
