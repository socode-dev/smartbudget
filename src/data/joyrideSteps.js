const step = (target, content) => ({
  target,
  content,
  disableBeacon: true,
});

export const overviewSteps = [
  step(
    "#notifications",
    "Notifications surface important account, budget, goal, and insight updates.",
  ),
  step(
    "#settings",
    "Use settings to adjust your theme, currency, alert thresholds, and exports.",
  ),
  step(
    "#total-income",
    "Total Income summarizes the money received in your current financial activity.",
  ),
  step(
    "#total-expenses",
    "Total Expenses shows your spending so you can quickly identify pressure on cash flow.",
  ),
  step(
    "#net-balance",
    "Net Balance compares income with expenses and shows whether you are ahead or behind.",
  ),
  step(
    "#budget-usage",
    "Budget Usage tracks how much of your planned spending has already been used.",
  ),
  step(
    "#financial-charts",
    "Financial Overview visualizes income, expenses, and budget movement over time.",
  ),
  step(
    "#smart-insights",
    "Smart Insights highlights the most important financial signals available to you.",
  ),
  step(
    "#budget-overview",
    "Budget Overview breaks down income and expense budget progress.",
  ),
  step(
    "#quick-actions",
    "Quick Actions provides fast access to entries, budgets, goals, and exports.",
  ),
];
