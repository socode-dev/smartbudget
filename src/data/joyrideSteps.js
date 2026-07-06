const step = (target, content) => ({
  target,
  content,
  disableBeacon: true,
});

export const overviewSteps = [
  step("#notifications", "Notifications surface important account, budget, goal, and insight updates."),
  step("#settings", "Use settings to adjust theme, currency, alert thresholds, preferences, and exports."),
  step("#total-income", "Total Income summarizes money received across the selected financial activity."),
  step("#total-expenses", "Total Expenses shows spending so you can quickly spot pressure on cashflow."),
  step("#net-balance", "Net Balance compares income against expenses and shows whether the customer is ahead or behind."),
  step("#budget-usage", "Budget Usage tracks how much planned spending has already been consumed."),
  step("#financial-charts", "Financial Overview visualizes income, expenses, and budget movement over time."),
  step("#smart-insights", "Smart Insights highlights the most important financial signals SmartBudget has generated."),
  step("#budget-overview", "Budget Overview breaks down income and expense budget progress."),
  step("#quick-actions", "Quick Actions gives fast access to common workflows like entries, budgets, goals, and exports."),
];

export const transactionsSteps = [
  step("#transactions-header", "Transactions is the customer activity ledger for income and expense records."),
  step("#transactions-filters", "Use filters to narrow activity by description, category, type, or date range."),
  step("#transactions-list", "The transaction list shows each record with date, category, amount, and available actions."),
  step("#transactions-summary", "The summary totals income, expenses, balance, and net position for the current view."),
  step("#transactions-empty-state", "When there is no activity yet, this empty state guides the first transaction entry."),
  step("#add-first-transaction-btn", "This starts the first income or expense record."),
];

export const budgetsSteps = [
  step("#budgets-header", "Budgets define the planned limits SmartBudget uses to measure spending discipline."),
  step("#budgets-search", "Search helps find a specific category budget quickly."),
  step("#budget-cards", "Budget cards show limits, used amounts, remaining balances, and progress by category."),
  step("#budgets-empty-state", "When no budgets exist, this page prompts the first category limit."),
  step("#add-first-budget-btn", "This starts the first budget setup."),
];

export const goalsSteps = [
  step("#goals-header", "Goals track savings targets and long-term customer commitments."),
  step("#goals-search", "Search helps find a specific savings goal."),
  step("#goal-cards", "Goal cards show targets, saved amounts, due dates, and contribution progress."),
  step("#goals-empty-state", "When no goals exist, this empty state guides the first savings target."),
  step("#add-first-goal-btn", "This starts the first goal setup."),
];

export const insightsSteps = [
  step("#insights-tabs", "Switch between active insights and the history of previous insight records."),
  step("#insights-grid", "Active insights show the current financial signals that need attention."),
  step("#insights-empty-state", "When no insight is available, SmartBudget is waiting for enough financial activity."),
];

export const reportsSteps = [
  step("#reports-header", "Reports summarize financial behavior for review and presentation."),
  step("#reports-charts", "Charts show spending trends and category concentration."),
  step("#export-buttons", "Exports create CSV or PDF reports when working with live data."),
  step("#reports-empty-state", "When there are no expenses, reports will appear after spending activity is available."),
];

export const steps = overviewSteps;
