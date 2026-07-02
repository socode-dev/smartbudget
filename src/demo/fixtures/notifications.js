export const demoNotifications = [
  {
    id: "demo-notification-risk",
    subject: "High financial risk detected",
    message:
      "The customer's June profile shows elevated risk due to rising expenses, exceeded budgets, and lower remaining cashflow.",
    type: "Insight",
    read: false,
    createdAt: new Date("2026-06-24T10:00:00").getTime(),
  },
  {
    id: "demo-notification-budget",
    subject: "Budget pressure in food and transportation",
    message:
      "Two essential categories are above planned levels. Review affordability before recommending additional obligations.",
    type: "Budget",
    read: false,
    createdAt: new Date("2026-06-18T10:00:00").getTime(),
  },
  {
    id: "demo-notification-history",
    subject: "Insight history available",
    message:
      "This demo includes active and expired insight records to show how SmartBudget preserves audit-friendly signal history.",
    type: "System",
    read: true,
    createdAt: new Date("2026-06-10T10:00:00").getTime(),
  },
];
