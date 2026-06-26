import { getActiveAttentionState, getSignalPeriod } from "./attentionState.js";
import {
    ANOMALY_ABSOLUTE_THRESHOLD,
    ANOMALY_INCREASE_THRESHOLD,
    BUDGET_PERCENT_THRESHOLD,
    CASHFLOW_PERCENT_THRESHOLD,
} from "../triggers/utils.js";

export const ATTENTION_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const RISK_SCORE_DELTA = 10;
export const URGENCY_OVERRIDE_DELTA = 15;

const SEVERITY_RANK = {
    SAFE: 0,
    LOW: 1,
    WARNING: 2,
    MEDIUM: 2,
    RISK: 3,
    HIGH: 3,
};

export const evaluateAttentionGate = async ({ userId, topSignal, scoredSignals = [] } = {}) => {
    if (!topSignal) {
        return { allowed: false, reason: "NO_SIGNAL" };
    }

    const activeEpisode = await getActiveAttentionState({ userId });

    return evaluateAttentionDecision({
        activeEpisode,
        topSignal,
        scoredSignals,
        now: Date.now(),
    });
};

export const evaluateAttentionDecision = ({
    activeEpisode,
    topSignal,
    scoredSignals = [],
    now = Date.now(),
} = {}) => {
    if (!topSignal) return { allowed: false, reason: "NO_SIGNAL" };
    if (!activeEpisode) return { allowed: true, reason: "NO_ACTIVE_EPISODE" };

    const currentPeriod = getSignalPeriod({ signal: topSignal });
    const activePeriod = activeEpisode.period;

    if (activePeriod && isDifferentPeriod({ activePeriod, currentPeriod })) {
        return { allowed: true, reason: "NEW_PERIOD_OR_EPISODE" };
    }

    if (isSeverityWorse({ topSignal, activeEpisode })) {
        return { allowed: true, reason: "SEVERITY_INCREASED" };
    }

    if (topSignal.type === "financial-risk") {
        return evaluateFinancialRiskEpisode({ activeEpisode, topSignal, scoredSignals, now });
    }

    if (activeEpisode.type === "financial-risk" && activeEpisode.snapshot?.systemicCrisis) {
        if (isCoveredByEpisode({ signal: topSignal, activeEpisode })) {
            return { allowed: false, reason: "SUPPRESSED_BY_ACTIVE_EPISODE" };
        }

        if (isNewHighSeveritySignal({ signal: topSignal })) {
            return { allowed: true, reason: "NEW_MATERIAL_SIGNAL", signalId: topSignal.id };
        }

        if (hasUrgencyOverride({ topSignal, activeEpisode })) {
            return { allowed: true, reason: "URGENCY_OVERRIDE" };
        }

        return { allowed: false, reason: "SUPPRESSED_BY_SYSTEMIC_RISK" };
    }

    if (isCoveredByEpisode({ signal: topSignal, activeEpisode })) {
        return { allowed: false, reason: "ACTIVE_EPISODE_UNCHANGED" };
    }

    if (isCooldownExpired({ activeEpisode, now })) {
        return { allowed: true, reason: "COOLDOWN_EXPIRED" };
    }

    return { allowed: true, reason: "NEW_TOP_SIGNAL" };
};

const evaluateFinancialRiskEpisode = ({ activeEpisode, topSignal, scoredSignals, now }) => {
    const previousScore = Number(activeEpisode.snapshot?.riskScore ?? 0);
    const currentScore = Number(topSignal.orchestrationContext?.riskScore ?? topSignal.data?.risk?.score ?? 0);

    if (currentScore - previousScore >= RISK_SCORE_DELTA) {
        return { allowed: true, reason: "RISK_SCORE_INCREASED" };
    }

    const previousCashflow = activeEpisode.snapshot?.cashflowOutcome;
    const currentCashflow = topSignal.orchestrationContext?.cashflowOutcome ?? topSignal.data?.signals?.cashflow_signals?.outcome;

    if (isCashflowWorse({ previousCashflow, currentCashflow })) {
        return { allowed: true, reason: "CASHFLOW_WORSENED" };
    }

    const materialSignal = findNewMaterialSignal({ activeEpisode, scoredSignals });

    if (materialSignal) {
        return { allowed: true, reason: "NEW_MATERIAL_SIGNAL", signalId: materialSignal.id };
    }

    const worsenedSignal = findWorsenedCoveredSignal({ activeEpisode, scoredSignals });

    if (worsenedSignal) {
        return { allowed: true, reason: "SUPPORTING_SIGNAL_WORSENED", signalId: worsenedSignal.id };
    }

    if (isCooldownExpired({ activeEpisode, now })) {
        return { allowed: true, reason: "COOLDOWN_EXPIRED" };
    }

    return { allowed: false, reason: "ACTIVE_EPISODE_UNCHANGED" };
};

const isCoveredByEpisode = ({ signal, activeEpisode }) => {
    const covered = activeEpisode.coveredSignals ?? {};

    if (signal.type === "anomaly") {
        const category = signal.data?.category ?? signal.orchestrationContext?.category;
        return covered.anomalyCategories?.includes(category);
    }

    if (signal.type === "budget") {
        const category = signal.data?.category ?? signal.orchestrationContext?.category;
        return covered.budgetCategories?.includes(category);
    }

    if (signal.type === "cashflow") {
        const outcome = signal.data?.outcome ?? signal.severity;
        return Boolean(covered.cashflowOutcome) && covered.cashflowOutcome === outcome;
    }

    return activeEpisode.type === signal.type;
};

const isNewHighSeveritySignal = ({ signal }) => {
    return ["HIGH", "RISK"].includes(String(signal.severity ?? "").toUpperCase());
};

const findNewMaterialSignal = ({ activeEpisode, scoredSignals = [] }) => {
    return scoredSignals.find(signal => {
        if (signal.type === "financial-risk") return false;
        if (!isNewHighSeveritySignal({ signal })) return false;

        return !isCoveredByEpisode({ signal, activeEpisode });
    });
};

const findWorsenedCoveredSignal = ({ activeEpisode, scoredSignals = [] }) => {
    return scoredSignals.find(signal => {
        if (signal.type === "financial-risk") return false;
        if (!isNewHighSeveritySignal({ signal })) return false;
        if (!isCoveredByEpisode({ signal, activeEpisode })) return false;

        return isCoveredSignalWorse({ signal, activeEpisode });
    });
};

const isCoveredSignalWorse = ({ signal, activeEpisode }) => {
    const covered = activeEpisode.coveredSignals ?? {};

    if (signal.type === "anomaly") {
        const category = signal.data?.category ?? signal.orchestrationContext?.category;
        const previous = covered.anomalySnapshots?.[category];
        const currentValue = Number(signal.data?.signal?.current_value ?? 0);

        return hasAnomalyIncrease({ previousValue: previous?.value, currentValue });
    }

    if (signal.type === "budget") {
        const category = signal.data?.category ?? signal.orchestrationContext?.category;
        const previous = covered.budgetSnapshots?.[category];
        const currentValue = Number(signal.data?.derived?.percent_budget_used ?? signal.orchestrationContext?.percentUsed ?? 0);

        return hasAbsoluteIncrease({
            previousValue: previous?.value,
            currentValue,
            threshold: BUDGET_PERCENT_THRESHOLD
        });
    }

    if (signal.type === "cashflow") {
        const previousValue = covered.cashflowSnapshot?.percentSpent;
        const currentValue = Number(signal.data?.derived?.percent_spent ?? 0);

        return hasAbsoluteIncrease({
            previousValue,
            currentValue,
            threshold: CASHFLOW_PERCENT_THRESHOLD
        });
    }

    return false;
};

const hasAnomalyIncrease = ({ previousValue, currentValue }) => {
    const previous = Number(previousValue ?? 0);
    const current = Number(currentValue ?? 0);

    if (!Number.isFinite(current) || current <= previous) return false;
    if (previous <= 0) return current - previous >= ANOMALY_ABSOLUTE_THRESHOLD;

    return (current - previous) / previous >= ANOMALY_INCREASE_THRESHOLD;
};

const hasAbsoluteIncrease = ({ previousValue, currentValue, threshold }) => {
    const previous = Number(previousValue ?? 0);
    const current = Number(currentValue ?? 0);

    if (!Number.isFinite(current) || current <= previous) return false;

    return current - previous >= threshold;
};

const isSeverityWorse = ({ topSignal, activeEpisode }) => {
    const previous = SEVERITY_RANK[String(activeEpisode.severity ?? "").toUpperCase()] ?? 0;
    const current = SEVERITY_RANK[String(topSignal.severity ?? "").toUpperCase()] ?? 0;

    return current > previous;
};

const hasUrgencyOverride = ({ topSignal, activeEpisode }) => {
    return Number(topSignal.urgencyScore ?? 0) - Number(activeEpisode.urgencyScore ?? 0) >= URGENCY_OVERRIDE_DELTA;
};

const isCooldownExpired = ({ activeEpisode, now }) => {
    const lastInsightAtMs = Number(activeEpisode.lastInsightAtMs ?? 0);
    return lastInsightAtMs > 0 && now - lastInsightAtMs >= ATTENTION_COOLDOWN_MS;
};

const isCashflowWorse = ({ previousCashflow, currentCashflow }) => {
    const previous = SEVERITY_RANK[String(previousCashflow ?? "").toUpperCase()] ?? 0;
    const current = SEVERITY_RANK[String(currentCashflow ?? "").toUpperCase()] ?? 0;

    return current > previous;
};

const isDifferentPeriod = ({ activePeriod, currentPeriod }) => {
    return activePeriod.month !== currentPeriod.month || activePeriod.year !== currentPeriod.year;
};
