// Overview page steps - comprehensive tour for new users
export const overviewSteps = [
  {
    target: "#notifications",
    content:
      "Stay updated with your financial progress with In-app notifications.",
    disableBeacon: true,
  },
  {
    target: "#settings",
    content:
      "Adjust your app settings here. Set your preferred theme, currency, preferences for thresholds and export all your data.",
    disableBeacon: true,
  },
  {
    target: "#total-income",
    content:
      "This shows your total income for the current month. Keep track of all money coming in.",
    disableBeacon: true,
  },
  {
    target: "#total-expenses",
    content:
      "Here's your total spending for the month. Monitor this to stay within your budget.",
    disableBeacon: true,
  },
  {
    target: "#net-balance",
    content: "Your net balance shows if you're spending more than you earn.",
    disableBeacon: true,
  },
  {
    target: "#budget-usage",
    content:
      "Track how much of your budget you've used. Try to stay under 100% to meet your goals.",
    disableBeacon: true,
  },
  {
    target: "#financial-charts",
    content:
      "Visual charts help you understand your spending patterns and budget distribution.",
    disableBeacon: true,
  },
  {
    target: "#smart-insights",
    content:
      "Get AI-powered insights and recommendations to improve your financial health.",
    disableBeacon: true,
  },
  {
    target: "#budget-overview",
    content:
      "Detailed breakdown of your income and expense budgets with progress tracking.",
    disableBeacon: true,
  },
  {
    target: "#quick-actions",
    content:
      "Quick access to add transactions, set budgets, create goals, and export your data.",
    disableBeacon: true,
  },
];

// Transactions page steps - focus on empty state and key buttons
export const transactionsSteps = [
  {
    target: "#transactions-empty-state",
    content:
      "This is where all your transactions will appear. Start by adding your first expense or income.",
    disableBeacon: true,
  },
  {
    target: "#add-first-transaction-btn",
    content:
      "Click here to add your first transaction. You can record both income and expenses.",
    disableBeacon: true,
  },
];

// Budgets page steps - focus on empty state and key actions
export const budgetsSteps = [
  {
    target: "#budgets-empty-state",
    content:
      "Set spending limits for different categories to stay on track with your financial goals.",
    disableBeacon: true,
  },
  {
    target: "#add-first-budget-btn",
    content:
      "Create your first budget by setting a spending limit for a category like groceries or entertainment.",
    disableBeacon: true,
  },
];

// Goals page steps - focus on empty state and goal creation
export const goalsSteps = [
  {
    target: "#goals-empty-state",
    content:
      "Set financial goals to save for things that matter to you - vacation, emergency fund, or a new car.",
    disableBeacon: true,
  },
  {
    target: "#add-first-goal-btn",
    content:
      "Create your first savings goal. Set a target amount and deadline to stay motivated.",
    disableBeacon: true,
  },
];

// Insights page steps - focus on empty state and understanding insights
export const insightsSteps = [
  {
    target: "#insights-empty-state",
    content:
      "SmartBudget analyzes your spending patterns to provide personalized insights and recommendations.",
    disableBeacon: true,
  },
  {
    target: "#insights-grid",
    content:
      "Your AI-powered insights will appear here, helping you make better financial decisions.",
    disableBeacon: true,
  },
];

// Reports page steps - focus on empty state and export features
export const reportsSteps = [
  {
    target: "#reports-empty-state",
    content:
      "Generate detailed reports and charts to analyze your spending patterns over time.",
    disableBeacon: true,
  },
  {
    target: "#reports-charts",
    content:
      "Visual charts show your spending trends and category breakdowns for better understanding.",
    disableBeacon: true,
  },
  {
    target: "#export-buttons",
    content:
      "Export your financial data as CSV or PDF files for record keeping or sharing with advisors.",
    disableBeacon: true,
  },
];

// Legacy export for backward compatibility
export const steps = overviewSteps;
