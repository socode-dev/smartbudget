import {
    RESERVED_LEASE_MS, 
    FAILED_RETRY_MS, 
    ANOMALY_ABSOLUTE_THRESHOLD, 
    ANOMALY_INCREASE_THRESHOLD, 
    BUDGET_PERCENT_THRESHOLD, 
    CASHFLOW_PERCENT_THRESHOLD, 
    CASHFLOW_RUNWAY_DROP_THRESHOLD,
    REMINDER_INTERVAL_MS, 
    RISK_SCORE_THRESHOLD,
    toNumber,
    isMeaningfulRunwayDrop
} from "./utils.js";

export const evaluateTrigger = ({ existing, trigger, now }) => {
    if (!existing) {
        return { allowed: true, reason: "FIRST_TIME" };
    }

    if (existing.status === "reserved" && now - (existing.reservedAtMs ?? 0) < RESERVED_LEASE_MS) {
        return { allowed: false, reason: "ALREADY_RESERVED" };
    }

    if (existing.status === "failed" && now - (existing.failedAtMs ?? 0) < FAILED_RETRY_MS) {
        return { allowed: false, reason: "RECENT_FAILURE" };
    }

    if (existing.fingerprint === trigger.fingerprint && existing.status === "fired") {
        const financialRiskReminderDue = trigger.type === "financial-risk" &&
            ["MEDIUM", "HIGH"].includes(currentRiskLevel({ trigger })) &&
            now - (existing.lastTriggeredAtMs ?? 0) >= REMINDER_INTERVAL_MS;

        if (financialRiskReminderDue) {
            return { allowed: true, reason: "FINANCIAL_RISK_REMINDER" };
        }

        return { allowed: false, reason: "ALREADY_FIRED" };
    }

    return evaluateByType({ existing, trigger, now });
};

const evaluateByType = ({ existing, trigger, now }) => {
    const previous = existing.snapshot ?? {};
    const current = trigger.snapshot;

    if (trigger.type === "anomaly") {
        const prevValue = toNumber(previous.currentValue);
        const currentValue = toNumber(current.currentValue);
        const increased = prevValue > 0
            ? (currentValue - prevValue) / prevValue >= ANOMALY_INCREASE_THRESHOLD
            : currentValue - prevValue >= ANOMALY_ABSOLUTE_THRESHOLD;

        if (previous.severity !== current.severity) return { allowed: true, reason: "SEVERITY_CHANGED" };
        if (increased) return { allowed: true, reason: "ANOMALY_INCREASED" };

        return { allowed: false, reason: "ANOMALY_UNCHANGED" };
    }

    if (trigger.type === "budget") {
        const percentChanged = Math.abs(toNumber(current.percentUsed) - toNumber(previous.percentUsed)) >= BUDGET_PERCENT_THRESHOLD;

        if (previous.compliance !== current.compliance) return { allowed: true, reason: "BUDGET_STATUS_CHANGED" };
        if (percentChanged) return { allowed: true, reason: "BUDGET_PERCENT_CHANGED" };

        return { allowed: false, reason: "BUDGET_UNCHANGED" };
    }

    if (trigger.type === "cashflow") {
        const percentChanged = toNumber(current.percentSpent) - toNumber(previous.percentSpent) >= CASHFLOW_PERCENT_THRESHOLD;
        const runwayDropped = isMeaningfulRunwayDrop(previous.spendingRunway, current.spendingRunway);
        const reminderDue = ["WARNING", "RISK"].includes(current.outcome) &&
            now - (existing.lastTriggeredAtMs ?? 0) >= REMINDER_INTERVAL_MS;

        if (previous.outcome !== current.outcome) return { allowed: true, reason: "CASHFLOW_OUTCOME_CHANGED" };
        if (previous.hasNoIncome !== current.hasNoIncome) return { allowed: true, reason: "INCOME_STATE_CHANGED" };
        if (percentChanged) return { allowed: true, reason: "CASHFLOW_PRESSURE_INCREASED" };
        if (runwayDropped) return { allowed: true, reason: "CASHFLOW_RUNWAY_DROPPED" };
        if (reminderDue) return { allowed: true, reason: "CASHFLOW_REMINDER" };

        return { allowed: false, reason: "CASHFLOW_UNCHANGED" };
    }

    if (trigger.type === "financial-risk") {
        const scoreIncreased = toNumber(current.score) - toNumber(previous.score) >= RISK_SCORE_THRESHOLD;

        if (previous.level !== current.level) return { allowed: true, reason: "RISK_LEVEL_CHANGED" };
        if (scoreIncreased) return { allowed: true, reason: "RISK_SCORE_INCREASED" };

        return { allowed: false, reason: "RISK_UNCHANGED" };
    }

    return { allowed: false, reason: "UNKNOWN_SIGNAL_TYPE" };
};

const currentRiskLevel = ({ trigger }) => {
    return String(trigger.snapshot?.level ?? "").toUpperCase();
};
