const createdAt = (date) => new Date(`${date}T09:00:00`).getTime();
const expiresAt = (date) => new Date(`${date}T23:59:59`).getTime();

export const demoInsights = [
  {
    id: "demo-insight-risk-jun",
    type: "financial-risk",
    status: "ACTIVE",
    severity: "HIGH",
    category: "Financial Risk",
    year: 2026,
    createdAt: createdAt("2026-06-24"),
    expiresAt: expiresAt("2026-07-01"),
    agent: {
      explanation:
        "June spending is rising faster than income, with multiple categories exceeding planned limits and a weaker cash position than prior months.",
      suggestion:
        "Review discretionary spending and prioritize food, transport, and rent obligations before approving new commitments.",
    },
    modelUsed: "Demo Rule Engine",
  },
  {
    id: "demo-insight-budget-food",
    type: "budget-compliance",
    status: "ACTIVE",
    severity: "HIGH",
    category: "Food",
    year: 2026,
    createdAt: createdAt("2026-06-18"),
    expiresAt: expiresAt("2026-06-25"),
    agent: {
      explanation:
        "Food spending has exceeded the June limit and is materially above the customer's earlier monthly pattern.",
      suggestion:
        "Confirm whether this reflects household pressure or a one-time purchase before increasing credit exposure.",
    },
    modelUsed: "Demo Rule Engine",
  },
];

export const demoInsightsHistory = [
  {
    id: "demo-history-risk-jun",
    type: "risk",
    status: "ACTIVE",
    category: null,
    severity: "HIGH",
    createdAt: createdAt("2026-06-24"),
    expiresAt: expiresAt("2026-07-01"),
  },
  {
    id: "demo-history-budget-food",
    type: "budget",
    status: "ACTIVE",
    category: "Food",
    severity: "HIGH",
    createdAt: createdAt("2026-06-18"),
    expiresAt: expiresAt("2026-06-25"),
  },
  {
    id: "demo-history-anomaly-transport",
    type: "anomaly",
    status: "EXPIRED",
    category: "Transportation",
    severity: "MEDIUM",
    createdAt: createdAt("2026-05-21"),
    expiresAt: expiresAt("2026-05-28"),
  },
  {
    id: "demo-history-cashflow-may",
    type: "cashflow",
    status: "EXPIRED",
    category: null,
    severity: "MEDIUM",
    createdAt: createdAt("2026-05-12"),
    expiresAt: expiresAt("2026-05-19"),
  },
  {
    id: "demo-history-budget-shopping",
    type: "budget",
    status: "EXPIRED",
    category: "Shopping",
    severity: "MEDIUM",
    createdAt: createdAt("2026-04-27"),
    expiresAt: expiresAt("2026-05-04"),
  },
];
