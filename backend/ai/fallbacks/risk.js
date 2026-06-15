export const riskFallback = ({ riskData }) => {
const {
risk,
period,
financial_facts,
} = riskData;

const explanation = (() => {
if (
!financial_facts.has_active_income &&
financial_facts.spending_trend === "INCREASING"
) {
return "Your spending has continued to grow while no active income has been recorded recently. If this pattern continues, maintaining the same level of spending may become harder over time.";
}

if (
financial_facts.spending_pressure === "HIGH" &&
financial_facts.recurring_pressure
) {
return "Spending pressure has been appearing repeatedly rather than as a one-time event. Patterns like this can become difficult to sustain if they continue unchecked.";
}

if (
financial_facts.budget_discipline === "POOR"
) {
return "Recent spending patterns suggest that financial plans are becoming harder to stay within, making it more difficult to maintain consistency over time.";
}

if (
financial_facts.spending_trend === "INCREASING"
) {
return "Your spending has been moving upward over time. While that may not create immediate problems, it can reduce financial flexibility if it continues.";
}

return "Your finances show signs of growing pressure that are worth paying attention to before they become harder to manage.";
})();

const suggestion = (() => {
if (
!financial_facts.has_active_income &&
financial_facts.spending_trend === "INCREASING"
) {
return "Reviewing recent spending increases may help create more room and flexibility going forward.";
}

if (
financial_facts.budget_discipline === "POOR"
) {
return "Checking spending against your plans more frequently can help prevent small issues from becoming larger ones.";
}

if (
financial_facts.spending_trend === "INCREASING"
) {
return "Keeping spending closer to recent historical levels may make your finances easier to sustain.";
}

return "Regular financial reviews can help you spot pressure early and make adjustments before it grows.";
})();

return {
id: riskData.id,

type: "financial-risk",

actionType: "suggestion",

severity: risk.level,

score: risk.score,

month: period.month,

year: period.year,

agent: {
explanation,
suggestion,
},
};
};