import {getDaysInMonth, getDate, getMonth, getYear} from "date-fns";
import {getInsightDate} from "../../utils/normalizeInsight";

export const buildBudgetComplianceData = (budget, transactions, currency) => {
    const now = new Date();
    const budgetDate = new Date(budget.date);

    const isCurrentMonth = getMonth(now) === getMonth(budgetDate) && getYear(now) === getYear(budgetDate);

    const currentMonth = getMonth(budgetDate) + 1;
    const currentYear = getYear(budgetDate);

    const totalDaysInMonth = getDaysInMonth(budgetDate);
    const todayDate = isCurrentMonth ? getDate(now) : totalDaysInMonth;
    const daysRemaining = isCurrentMonth ? totalDaysInMonth - todayDate : 0;

    const percentOfMonthElapsed = Math.round((todayDate / totalDaysInMonth) * 100);

    const categoryTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (transaction.categoryKey === budget.categoryKey && transaction.type === budget.type && getMonth(transactionDate) + 1 === currentMonth && getYear(transactionDate) === currentYear);
    })

    const totalSpent = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    const transactionCount = categoryTransactions.length;
    const lastTransaction = categoryTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const percentBudgetUsed = budget.amount > 0 ? Math.round((totalSpent / budget.amount) * 100) : 0;

    const dailyBurnRate = todayDate > 0 ? totalSpent / todayDate : 0;

    const projectedTotal = Math.round(dailyBurnRate * totalDaysInMonth);

    const remainingBudget = budget.amount - totalSpent;

    const safeDailySpend = daysRemaining > 0 ? parseFloat((remainingBudget / daysRemaining).toFixed(2)) : 0;

    const getComplianceStatus = () => {
        if(percentBudgetUsed >= 100) return "EXCEEDED";
        if(percentBudgetUsed >= 85 && daysRemaining > 7) return "AT_RISK";
        if(percentBudgetUsed >= percentOfMonthElapsed + 20) return "AT_RISK";
        if(percentBudgetUsed >= percentOfMonthElapsed) return "BORDERLINE";

        return "ON_TRACK";
    }

    const status = getComplianceStatus(); 

    const getRiskLevel = () => {
        if(status === "EXCEEDED" || status === "AT_RISK") return "HIGH";
        return "MEDIUM";
    }

     return {
        id: `budget_${Math.random().toString(36).slice(2)}`,
        category: budget.category,
        budget: {
            amount: budget.amount,
            month: new Intl.DateTimeFormat("en-US", {month: "short"}).format(new Date(budget.date)),
            year: new Intl.DateTimeFormat("en-US", {year: "numeric"}).format(new Date(budget.date)),
            currency,
            setOn: getDate(new Date(budget.date)),
        },
        spending: {
            total_spent: parseFloat(totalSpent.toFixed(2)),
            transaction_count: transactionCount,
            last_transaction_date: lastTransaction?.date ?? null,
        },
        time: {
            days_elapsed: todayDate,
            days_remaining: daysRemaining,
            total_days_in_month: totalDaysInMonth,
            percent_of_month_elapsed: percentOfMonthElapsed,
            is_current_month: isCurrentMonth
        },
        derived: {
            percent_budget_used: percentBudgetUsed,
            daily_burn_rate: parseFloat(dailyBurnRate.toFixed(2)),
            safe_daily_spend: safeDailySpend,
            compliance_status: status,
            risk_level: getRiskLevel(),
            projected_total: projectedTotal
        },
     }
}