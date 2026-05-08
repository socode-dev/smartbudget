import { getDaysInMonth, getDate, getMonth, getYear } from "date-fns";
import {v4 as uuidv4} from "uuid";

export const buildCashFlowData = (transactions, currency) => {
const now = new Date();

const currentMonth = getMonth(now) + 1;
const currentYear = getYear(now);

const todayDate = getDate(now);
const totalDaysInMonth = getDaysInMonth(now);
const daysRemaining = totalDaysInMonth - todayDate;

const percentOfMonthElapsed = Math.round(
(todayDate / totalDaysInMonth) * 100
);

const currentMonthTransactions = transactions.filter((transaction) => {
const transactionDate = new Date(transaction.date);

return (
getMonth(transactionDate) + 1 === currentMonth &&
getYear(transactionDate) === currentYear
);
});

const totalIncome = totalAmount(currentMonthTransactions, "income");
const totalSpent = totalAmount(currentMonthTransactions, "expense");

const rawBalance = totalIncome - totalSpent;

const currentBalance = rawBalance > 0 ? parseFloat(rawBalance.toFixed(2)) : 0;

const safeDailySpend =
daysRemaining > 0 && currentBalance > 0
? parseFloat((currentBalance / daysRemaining).toFixed(2))
: 0;

const percentSpent =
totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 0;

const getProjectionConfidence = () => {
if (todayDate <= 3) return "LOW";
if (todayDate <= 7) return "MEDIUM";
return "HIGH";
};

const projectionConfidence = getProjectionConfidence();

// Only calculate burn rate when meaningful
const dailyBurnRate =
projectionConfidence === "LOW"
? null
: parseFloat((totalSpent / todayDate).toFixed(2));

// Runway uses safe fallback if burn rate is unreliable
let spendingRunwayDays = null;

if(projectionConfidence === "LOW") {
  if(safeDailySpend > 0 && currentBalance > 0) {
    spendingRunwayDays = Math.floor(currentBalance / safeDailySpend);
  }
} else {
  if(dailyBurnRate > 0 && currentBalance > 0) {
    spendingRunwayDays = Math.floor(currentBalance / dailyBurnRate)
  }
}

let projectedTotalSpend = null;
let projectedRemainingBalance = null;

if (projectionConfidence !== "LOW") {
const rawProjection = dailyBurnRate * totalDaysInMonth;
const MAX_MULTIPLIER = 2;

projectedTotalSpend = Math.min(
rawProjection,
totalIncome > 0 ? totalIncome * MAX_MULTIPLIER : rawProjection
);

projectedTotalSpend = parseFloat(projectedTotalSpend.toFixed(2));

projectedRemainingBalance = parseFloat(
Math.max(0, totalIncome - projectedTotalSpend).toFixed(2)
);
}

const hasNoIncome = totalIncome === 0;

const getOutcome = () => {
if (hasNoIncome) {
  if(totalSpent > 0) {
    return "RISK"
  }
return "SAFE";
}

const currentRatio = totalSpent / totalIncome;

if (projectionConfidence === "LOW") {
if (spendingRunwayDays !== null && spendingRunwayDays <= 5)
return "WARNING";
if (currentRatio >= 0.4 && percentSpent > percentOfMonthElapsed * 2)
return "WARNING";
return "SAFE";
}

const projectedRatio =
projectedTotalSpend !== null
? projectedTotalSpend / totalIncome
: 0;

if (projectedRatio >= 1 && currentRatio >= 0.4) return "RISK";
if (projectedRatio >= 1) return "WARNING";
if (projectedRatio >= 0.85 || currentRatio >= 0.8) return "WARNING";

return "SAFE";
};

const outcome = getOutcome();

return {
  id: `txn_${uuidv4()}`,
period: {
days_elapsed: todayDate,
days_remaining: daysRemaining,
percent_elapsed: percentOfMonthElapsed,
month: new Intl.DateTimeFormat("en-US", {month: "short"}).format(now),
year: new Intl.DateTimeFormat("en-US", {year: "numeric"}).format(now)
},
income: {
total: parseFloat(totalIncome.toFixed(2)),
currency
},
spending: {
total_spent: parseFloat(totalSpent.toFixed(2)),
current_balance: currentBalance
},
forecast: {
safe_daily_spend: safeDailySpend,
spending_runway_days: spendingRunwayDays,
projected_total_spend: projectedTotalSpend,
projected_remaining_balance: projectedRemainingBalance
},
derived: {
percent_spent: percentSpent,
projection_confidence: projectionConfidence,
has_no_income: hasNoIncome
},
outcome
};
};

const totalAmount = (transactions, type) => {
return transactions
.filter((t) => t.type === type)
.reduce((sum, t) => sum + (typeof t.amount === "number" ? t.amount : 0), 0);
};