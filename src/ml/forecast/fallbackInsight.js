import { formatAmount } from "../../utils/formatAmount";

export const fallback = (complianceData) => {
const {
income,
spending,
forecast,
outcome,
period
} = complianceData;

const currency = income.currency;

const isEarly = period.days_elapsed < 15;

// EARLY MONTH LOGIC
if (isEarly) {
    const {explanation, suggestion} = getEarlyMonthInsight(outcome, spending, income, forecast, period, currency);

    const insight = getInsightData(explanation, suggestion, outcome, period.month, period.year);

    return insight;
};

// LATE MONTH LOGIC
    const {explanation, suggestion} = getLateMonthInsight(outcome, spending, income, forecast, period, currency);

    const insight = getInsightData(explanation, suggestion, outcome, period.month, period.year);

    return insight
};



const getEarlyMonthInsight = (outcome, spending, income, forecast, period, currency) => {
    let explanation;
    let suggestion;
    
    switch (outcome) {
        case "RISK":
            explanation = `You have spent ${formatAmount(spending.total_spent, currency)} from your current income of ${formatAmount(income.total, currency)} within ${period.days_elapsed}. If you keep spending at your current pace, your money is not going last through the month.`;

            suggestion = `Reduce your daily spending so your balance can last through the rest of the month.`;
    
            break;

        case "WARNING":
            explanation = `You have already used ${derived.percent_spent}% of your current income early in the month. Your spending pace is higher than expected for this stage of the month.`;

            suggestion = `Slow down your daily spending so your remaining balance can last comfortably through the month.`;
    
            break
    
        default:
            explanation = `Your spending is currently within a healthy range compared to your current income and remaining balance.`;

            suggestion = `Maintain your current spending pace to keep your finances stable through the month.`;
    }

    return {explanation, suggestion}
}

const getLateMonthInsight = (outcome, spending, income, forecast, period, currency) => {
    let explanation;
    let suggestion;

    switch (outcome) {
        case "RISK":
            explanation = `You have spent ${formatAmount(spending.total_spent, currency)} against your current income. At your current pace, you will spend more than your current income by the month end.`;

            suggestion = `Limit your spending per day to reduce further overspending before month end.`;
            
            break;

        case "WARNING":
            explanation = `Your spending is increasing quickly compared to your current income. If this pace continues through the rest of the month, your remaining balance will become tight.`;

            suggestion = `Keep your daily spending lower for the remaining ${period.days_remaining} days to stay within your current income.`;
            
            break;
    
        default:
            explanation = `Your current spending remains within your available income for this month.`;

            suggestion = `Continue managing your spending carefully to maintain a stable balance through month end.`;
        };

        return {explanation, suggestion}
    }

const getInsightData = (explanation, suggestion, outcome, month, year) => {

    let riskLevel;

    switch (outcome) {
        case "RISK":
            riskLevel = "HIGH";
            break;
        case "WARNING":
            riskLevel = "MEDIUM";
        default:
            riskLevel = "LOW";
    }

        return {
        id: `cash_flow_${Math.random().toString(36).slice(2)}`,
      type: "cash-flow-forecast",
      actionType: "suggestion",
      createdAt: new Date(),
      severity: riskLevel,
      category: null,
      month,
      year,
      agent: { explanation, suggestion }
    }
    }