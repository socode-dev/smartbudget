import { getMonth, getYear } from "date-fns";        
import useCurrencyStore from  "../store/useCurrencyStore";
import {v4 as uuidv4} from "uuid";

export const buildRiskData = (anomalies, budgetComplianceData, cashflowData, transactions) => {
    const {selectedCurrency: currency} = useCurrencyStore.getState();

    const anomalyCount = anomalies.length;
    const highAnomalies = anomalies.filter(a => a.risk.level === "HIGH");
    const mediumAnomalies = anomalies.filter(a => a.risk.level === "MEDIUM");
    const maxAnomalyScore = anomalyCount > 0 ? Math.max(...anomalies.map(a => a.risk.score)) : 0;

    const repeatedAnomalyCategory = anomalies.filter(a => a.context.highest_in_period).map(a => a.category);

    const exceededBudgets = budgetComplianceData.filter(b => b.derived.compliance_status === "EXCEEDED");
    const atRiskBudgets = budgetComplianceData.filter(b => b.derived.compliance_status === "AT_RISK");    
    const totalBudgets = budgetComplianceData.length;
    
    const budgetComplianceRate = totalBudgets > 0 ? Math.round(((totalBudgets - exceededBudgets.length) / totalBudgets) * 100) : 100; 

    const cashFlowOutcome = cashflowData.outcome;
    const percentSpent = cashflowData.derived.percent_spent;
    const projectionConfidence = cashflowData.derived.projection_confidence;
    const spendingRunwayDays = cashflowData.forecast.spending_runway_days ?? 0;
    const hasNoIncome = cashflowData.derived.has_no_income;

    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);

    const savingsRate = cashflowData.income.total > 0 ? 
    Math.max(0, Math.round(
        ((cashflowData.income.total - cashflowData.spending.total_spent) / cashflowData.income.total) * 100
    ))
    : 0;

    const monthsWithIncome = new Set(
        transactions
        .filter(t => t.type === "income")
        .map(t  => {
            const date = new Date(t.date);
            return `${getYear(date)}-${getMonth(date) + 1}`
        })
    ).size;

    const monthlySpending = {};

    transactions
        .filter(t => t.type === "expense" && getYear(new Date(t.date)) === currentYear)
        .forEach(t => {
            const month = getMonth(new Date(t.date)) + 1;
            monthlySpending[month] = (monthlySpending[month] || 0) + t.amount;
        });

    const spendingTrend = Object.values(monthlySpending);
    
    const isSpendingIncreasing = spendingTrend.length >= 2 ? spendingTrend[spendingTrend.length - 1] > spendingTrend[spendingTrend.length - 2] : false;

    let riskScore = 0;

    const anomalyIntensityScore = anomalies.reduce((total, anomaly) => {
        const deviation = anomaly.signal?.deviation_percent || 0;

        return total + Math.min(deviation / 40, 10);
    }, 0);

    riskScore += Math.min(anomalyIntensityScore, 30);

    const budgetOverrunScore = exceededBudgets.reduce((total, budget) => {
        const percentUsed = budget.derived.percent_budget_used || 0;

        const overrunPercent = Math.max(percentUsed - 100, 0);

        return total + Math.min(overrunPercent / 20, 8);
    }, 0);

    riskScore += Math.min(budgetOverrunScore, 25);

    if(cashFlowOutcome === "RISK") {
        riskScore += 25;
    } else if (cashFlowOutcome === "WARNING") {
        riskScore += 15;
    }

    const incomeMissingRisk = hasNoIncome && monthsWithIncome >= 3;

    if(incomeMissingRisk) riskScore += 10;
    
    if(repeatedAnomalyCategory.length >= 3)  {
        riskScore += 10;
    } else if (repeatedAnomalyCategory.length >= 2) {
        riskScore += 5;
    }


    if(isSpendingIncreasing) riskScore += 10;

    riskScore = Math.min(Math.round(riskScore), 100);

    const isSystemicCrisis = highAnomalies.length >= 2 && exceededBudgets.length >= 2;

    const getRiskLevel = () => {
        if(isSystemicCrisis) return "HIGH"
        if(riskScore >= 80) return "HIGH";
        if(riskScore >= 50) return "MEDIUM";
        return "LOW";
    }

    const riskLevel = getRiskLevel();

    if(riskLevel === "LOW") return null;

    return {
        id: `risk_${uuidv4()}`,
        period: {
            month: new Intl.DateTimeFormat("en-US", {month: "short"}).format(now),
            year: new Intl.DateTimeFormat("en-US", {year: "numeric"}).format(now)
        },
        risk: {
            score: riskScore,
            level: riskLevel,
            currency
        },
        financial_facts: {
            has_active_income: !hasNoIncome,
            income_consistency: monthsWithIncome >= 6 ? "STABLE" : monthsWithIncome >= 3 ? "PARTIAL" : "LOW",

            spending_trend: isSpendingIncreasing ? "INCREASING" : "STABLE",

            spending_pressure: anomalyCount >= 3 ? "HIGH" : anomalyCount >= 1 ? "MEDIUM" : "LOW",

            recurring_pressure: repeatedAnomalyCategory.length >= 2,

            severe_spending_spikes: highAnomalies.length > 0,

            budget_discipline: exceededBudgets.length >= 3 ? "POOR" : exceededBudgets.length >= 1 ? "WEAK" : "GOOD",

            cashflow_health: cashFlowOutcome,

            financial_stability: riskLevel,

            is_systemic_crisis: isSystemicCrisis,
        },
        signals: {
            anomaly_signals: {
                total_anomalies: anomalyCount,
                high_count: highAnomalies.length,
                medium_count: mediumAnomalies.length,
                repeated_categories: repeatedAnomalyCategory,
            },
            budget_signals: {
                exceeded_count: exceededBudgets.length,
                at_risk_count: atRiskBudgets.length,
                compliance_rate: budgetComplianceRate
            },
            cashflow_signals: {
                outcome: cashFlowOutcome,
                percent_spent: percentSpent,
                savings_rate: savingsRate,
                has_no_income: hasNoIncome,
                projection_confidence: projectionConfidence
            },
            historical: {
                months_with_income: monthsWithIncome,
                is_spending_increasing: isSpendingIncreasing,
                monthly_spending_trend: monthlySpending
            }
        }
    };

};