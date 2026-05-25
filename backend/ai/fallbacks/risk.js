export const riskFallback = ({riskData}) => {
    
    return {
        id: riskData.id,
        type: "financial-risk",
        actionType: "suggestion",
        severity: riskData.risk.level,
        score: riskData.risk.score,
        month: riskData.period.month,
        year: riskData.period.year,

        agent: {
            explanation: (() => {
                if (riskData.risk.level === "HIGH") {
                return "Your recent financial activity points to serious instability. Repeated overspending, unusual spending spikes, and ongoing strain on your current income are all showing up at the same time. This is not a one-off situation.";
                }
                return "Your recent financial activity shows growing pressure on your finances. Spending is rising faster than your current income can comfortably support.";
            })(),

            suggestion: (() => {
                if (riskData.historical.is_spending_increasing) {
                return "Make it a habit to review your spending every week before it compounds. Catching pressure early is more effective than reacting after the month ends.";
                }
                if (riskData.budget_signals.exceeded_count > 0) {
                return "Before spending in any category this week, check whether you have already exceeded or are close to your budget for it. Building that check into your routine will reduce financial pressure over time.";
                }
                return "Focus on keeping a consistent portion of your current income unspent each month. Even a small buffer builds financial stability over time.";
            })()
        },
};
}