import { formatAmount } from "../../utils/formatAmount";

export const fallback = (complianceData) => {
    const { category, budget, spending, time, derived } = complianceData;

    if(!category || !budget || !spending || !time || !derived) return;
    
    const currency = budget.currency;
    const isCurrentMonth = time.is_current_month;

    const budgetAmount = formatAmount(budget.amount, currency);
    const spent = formatAmount(spending.total_spent, currency);
    const projected = formatAmount(derived.projected_total, currency);
    const safeDaily = formatAmount(derived.safe_daily_spend, currency);

    let explanation = "";
    let suggestion = "";

    if (!isCurrentMonth) {
    explanation = `You set a ${budgetAmount} ${category.toLowerCase()} budget for ${budget.month}. You spent ${spent}, which is ${derived.percent_budget_used}% of your budget by the end of the month.`;

    if (derived.percent_budget_used > 100) {
    suggestion = `You overspent your budget. Consider adjusting your budget or reducing non-essential ${category.toLowerCase()} expenses next month.`;
    } else {
    suggestion = `You stayed within your budget. Maintain this spending pattern next month to stay consistent.`;
    }

    return insightData(category, budget.month, budget.year, derived.risk_level, explanation, suggestion);
    }

    explanation = `You set a ${budgetAmount} ${category.toLowerCase()} budget for ${budget.month}. You have spent ${spent}, which is ${derived.percent_budget_used}% of your budget with ${time.days_remaining} days left. Your total spending is projected to reach ${projected} by month end.`;

    switch (derived.compliance_status) {
      case "EXCEEDED":
        suggestion = `Limit your ${category.toLowerCase()} spending to essentials only for the remaining ${time.days_remaining} days to reduce further overspending.`;
        break;
      case "AT_RISK":
        suggestion = `Reduce your ${category.toLowerCase()} spending and aim to stay around ${safeDaily} per day for the rest of the month.`;
        break;
      case "BORDERLINE":
        suggestion = `Keep your ${category.toLowerCase()} spending controlled and stay close to ${safeDaily} per day to remain within budget.`;
        break;
      default:
        suggestion = `You are on track. Continue keeping your ${category.toLowerCase()} spending within ${safeDaily} per day.`;
    }

    return insightData(category, budget.month, budget.year, derived.risk_level, explanation, suggestion)
}

const insightData = (category, month, year, riskLevel, explanation, suggestion) => {
  return {
        id: `budget_${Math.random().toString(36).slice(2)}`,
      type: "budget-compliance",
      actionType: "suggestion",
      createdAt: new Date(),
      severity: riskLevel,
      category,
      month,
      year,
      agent: { explanation, suggestion }
    }
}