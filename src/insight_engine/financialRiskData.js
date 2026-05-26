import { getMonth, getYear } from "date-fns";        
import useCurrencyStore from  "../store/useCurrencyStore";
import {v4 as uuidv4} from "uuid";

export const buildFinancialRiskData = (anomalies, budgetComplianceData, cashFlowData, transactions) => {
    const {selectedCurrency: currency} = useCurrencyStore.getState();

    // Anomaly signals
    const anomalyCount = anomalies.length;
    const highAnomalies = anomalies.filter(a => a.risk.level === "HIGH");
    const mediumAnomalies = anomalies.filter(a => a.risk.level === "MEDIUM");
    const maxAnomalyScore = anomalyCount > 0 ? Math.max(...anomalies.map(a => a.risk.score)) : 0;

    const repeatedAnomalyCategory = anomalies.filter(a => a.context.highest_in_period).map(a => a.category);

    // Budget signals
    const exceededBudgets = budgetComplianceData.filter(b => b.derived.compliance_status === "EXCEEDED");
    const atRiskBudgets = budgetComplianceData.filter(b => b.derived.compliance_status === "AT_RISK");    
    const totalBudgets = budgetComplianceData.length;
    
    const budgetComplianceRate = totalBudgets > 0 ? Math.round(((totalBudgets - exceededBudgets.length) / totalBudgets) * 100) : 100; 

    // Cash flow signals
    const cashFlowOutcome = cashFlowData.outcome;
    const percentSpent = cashFlowData.derived.percent_spent;
    const projectionConfidence = cashFlowData.derived.projection_confidence;
    const spendingRunwayDays = cashFlowData.forecast.spending_runway_days ?? 0;
    const hasNoIncome = cashFlowData.derived.has_no_income;

    // Historical signals
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);

    // % of income left after spending
    const savingsRate = cashFlowData.income.total > 0 ? 
    Math.max(0, Math.round(
        ((cashFlowData.income.total - cashFlowData.spending.total_spent) / cashFlowData.income.total) * 100
    ))
    : 0;

    // Income consistency
    const monthsWithIncome = new Set(
        transactions
        .filter(t => t.type === "income")
        .map(t  => {
            const date = new Date(t.date);
            return `${getYear(date)}-${getMonth(date) + 1}`
        })
    ).size;

        // Month over month spending trend
        const monthlySpending = {};

        transactions
        .filter(t => t.type === "expense" && getYear(new Date(t.date)) === currentYear)
        .forEach(t => {
            const month = getMonth(new Date(t.date)) + 1;
            monthlySpending[month] = (monthlySpending[month] || 0) + t.amount;
        });

        const spendingTrend = Object.values(monthlySpending);
        const isSpendingIncreasing = spendingTrend.length >= 2 ? spendingTrend[spendingTrend.length - 1] > spendingTrend[spendingTrend.length - 2] : false;

        // Risk score calculation (0-100)
        let riskScore = 0;

        // Anomaly contribution (30 points max)
        riskScore += Math.min(highAnomalies.length * 10, 20);
        riskScore += Math.min(mediumAnomalies.length * 5, 10);

        // Budget contribution (30points max)
        riskScore += Math.min(exceededBudgets.length * 10, 20);
        riskScore += Math.min(atRiskBudgets.length * 5, 10);

        // Cash flow contribution (25 points max)
        if(cashFlowOutcome === "RISK") riskScore += 25;
        else if (cashFlowOutcome === "WARNING") riskScore += 15;

        // Savings rate contribution (10 points max)
        if(savingsRate < 10) riskScore += 10;
        else if (savingsRate < 20) riskScore += 5;

        // Spending trend contribution (5 points max)
        if(isSpendingIncreasing) riskScore += 5;

        const getRiskLevel = () => {
            if(riskScore >= 70) return "HIGH";
            if(riskScore >= 40) return "MEDIUM";
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
        };

};