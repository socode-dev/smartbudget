import { db, FieldValue } from "../../../lib/firebaseAdmin.js";

export const ATTENTION_COLLECTION = "aiAttentionState";
export const CURRENT_ATTENTION_DOC = "current";

const getAttentionRef = ({ userId }) => {
    return db
        .collection("users")
        .doc(userId)
        .collection(ATTENTION_COLLECTION)
        .doc(CURRENT_ATTENTION_DOC);
};

export const getActiveAttentionState = async ({ userId } = {}) => {
    if (!userId) return null;

    try {
        const snap = await getAttentionRef({ userId }).get();
        return snap.exists ? snap.data() : null;
    } catch (err) {
        console.error(`ATTENTION_STATE_READ_FAILED: ${err}`);
        return null;
    }
};

export const saveAttentionState = async ({ userId, signal, scoredSignals = [], insight } = {}) => {
    if (!userId || !signal?.type) return false;

    try {
        const now = Date.now();

        await getAttentionRef({ userId }).set({
            episodeKey: getEpisodeKey({ signal }),
            signalId: signal.id ?? null,
            insightId: insight?.id ?? null,
            type: signal.type,
            severity: signal.severity ?? null,
            urgencyScore: signal.urgencyScore ?? 0,
            period: getSignalPeriod({ signal }),
            snapshot: buildAttentionSnapshot({ signal }),
            coveredSignals: buildCoveredSignals({ signal, scoredSignals }),
            status: "active",
            lastInsightAt: FieldValue.serverTimestamp(),
            lastInsightAtMs: now,
            updatedAt: FieldValue.serverTimestamp(),
            updatedAtMs: now,
        }, { merge: true });

        return true;
    } catch (err) {
        console.error(`ATTENTION_STATE_WRITE_FAILED: ${err}`);
        return false;
    }
};

export const getEpisodeKey = ({ signal } = {}) => {
    const period = getSignalPeriod({ signal });
    return [signal?.type ?? "unknown", period.month, period.year].join(":");
};

export const getSignalPeriod = ({ signal } = {}) => {
    const data = signal?.data ?? {};

    if (signal?.type === "anomaly") {
        const [year, month] = String(data.signal?.month ?? "").split(",").map(value => value.trim());
        return { month: month || "unknown", year: year || "unknown" };
    }

    if (signal?.type === "budget") {
        return {
            month: data.budget?.month ?? "unknown",
            year: data.budget?.year ?? "unknown",
        };
    }

    return {
        month: data.period?.month ?? "unknown",
        year: data.period?.year ?? "unknown",
    };
};

export const buildAttentionSnapshot = ({ signal } = {}) => {
    const context = signal?.orchestrationContext ?? {};
    const data = signal?.data ?? {};

    if (signal?.type === "financial-risk") {
        return {
            riskScore: context.riskScore ?? data.risk?.score ?? 0,
            cashflowOutcome: context.cashflowOutcome ?? data.signals?.cashflow_signals?.outcome ?? null,
            anomalyCount: context.anomalyCount ?? data.signals?.anomaly_signals?.total_anomalies ?? 0,
            exceededBudgets: context.exceededBudgets ?? data.signals?.budget_signals?.exceeded_count ?? 0,
            spendingTrend: Boolean(context.spendingTrend ?? data.signals?.historical?.is_spending_increasing),
            systemicCrisis: Boolean(data.financial_facts?.is_systemic_crisis),
        };
    }

    if (signal?.type === "cashflow") {
        return {
            outcome: data.outcome ?? signal.severity ?? null,
            percentSpent: data.derived?.percent_spent ?? 0,
            hasNoIncome: Boolean(data.derived?.has_no_income),
        };
    }

    if (signal?.type === "budget") {
        return {
            category: data.category ?? context.category ?? null,
            percentUsed: data.derived?.percent_budget_used ?? context.percentUsed ?? 0,
            compliance: data.derived?.compliance_status ?? context.compliance ?? null,
        };
    }

    if (signal?.type === "anomaly") {
        return {
            category: data.category ?? context.category ?? null,
            currentValue: data.signal?.current_value ?? 0,
            deviationPercent: data.signal?.deviation_percent ?? context.deviationPercent ?? 0,
        };
    }

    return {};
};

export const buildCoveredSignals = ({ signal, scoredSignals = [] } = {}) => {
    const anomalyCategories = unique(
        scoredSignals
            .filter(item => item.type === "anomaly")
            .map(item => item.data?.category ?? item.orchestrationContext?.category)
    );

    const budgetCategories = unique(
        scoredSignals
            .filter(item => item.type === "budget")
            .map(item => item.data?.category ?? item.orchestrationContext?.category)
    );

    const cashflow = scoredSignals.find(item => item.type === "cashflow");
    const cashflowOutcome = cashflow?.data?.outcome ?? cashflow?.severity ?? null;

    return {
        anomalyCategories,
        anomalySnapshots: buildCategorySnapshots({
            signals: scoredSignals,
            type: "anomaly",
            getCategory: item => item.data?.category ?? item.orchestrationContext?.category,
            getValue: item => item.data?.signal?.current_value ?? 0,
            getPercent: item => item.data?.signal?.deviation_percent ?? item.orchestrationContext?.deviationPercent ?? 0,
        }),
        budgetCategories,
        budgetSnapshots: buildCategorySnapshots({
            signals: scoredSignals,
            type: "budget",
            getCategory: item => item.data?.category ?? item.orchestrationContext?.category,
            getValue: item => item.data?.derived?.percent_budget_used ?? item.orchestrationContext?.percentUsed ?? 0,
            getPercent: item => item.data?.derived?.percent_budget_used ?? item.orchestrationContext?.percentUsed ?? 0,
        }),
        cashflowOutcome: signal?.type === "financial-risk"
            ? signal.data?.financial_facts?.cashflow_health ?? cashflowOutcome
            : cashflowOutcome,
        cashflowSnapshot: cashflow ? {
            outcome: cashflow.data?.outcome ?? cashflow.severity ?? null,
            percentSpent: cashflow.data?.derived?.percent_spent ?? 0,
        } : null,
    };
};

const buildCategorySnapshots = ({ signals, type, getCategory, getValue, getPercent }) => {
    return signals
        .filter(item => item.type === type)
        .reduce((snapshots, item) => {
            const category = getCategory(item);
            if (!category) return snapshots;

            snapshots[category] = {
                value: Number(getValue(item) ?? 0),
                percent: Number(getPercent(item) ?? 0),
                severity: item.severity ?? null,
            };

            return snapshots;
        }, {});
};

const unique = values => [...new Set(values.filter(Boolean))];
