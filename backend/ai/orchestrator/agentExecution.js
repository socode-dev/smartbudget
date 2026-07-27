import { fallback as anomalyFallback } from "../fallbacks/anomaly.js";
import { fallback as budgetFallback } from "../fallbacks/budget.js";
import { fallback as cashflowFallback } from "../fallbacks/cashflow.js";
import { riskFallback } from "../fallbacks/risk.js";

export const AGENT_TIMEOUT_MS = 25000;

const FALLBACK_MAP = {
    anomaly: data => anomalyFallback({ anomaly: data }),
    budget: data => budgetFallback({ complianceData: data }),
    cashflow: data => cashflowFallback({ cashflowData: data }),
    "financial-risk": data => riskFallback({ riskData: data }),
};

export const runAgentWithFallback = async ({
    agent,
    selectedSignal,
    userId,
    isDemo,
    timeoutMs = AGENT_TIMEOUT_MS
}) => {
    try {
        return await runAgentWithTimeout({
            agent,
            selectedSignal,
            userId,
            isDemo,
            timeoutMs
        });
    } catch (agentExecutionError) {
        return buildFallbackInsight({
            selectedSignal,
            error: agentExecutionError
        });
    }
};

const runAgentWithTimeout = async ({ agent, selectedSignal, userId, isDemo, timeoutMs }) => {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error("AI provider timed out"));
        }, timeoutMs);
    });

    try {
        const insight = await Promise.race([
            agent({ data: selectedSignal.data, userId, isDemo }),
            timeoutPromise
        ]);

        if (!isValidInsight(insight)) {
            throw new Error("AI output malformed");
        }

        return insight;
    } finally {
        clearTimeout(timeoutId);
    }
};

const isValidInsight = insight => {
    return Boolean(
        insight &&
        typeof insight === "object" &&
        insight.agent &&
        typeof insight.agent.explanation === "string" &&
        typeof insight.agent.suggestion === "string"
    );
};

const buildFallbackInsight = ({ selectedSignal, error }) => {
    const fallbackBuilder = FALLBACK_MAP[selectedSignal.type];

    if (!fallbackBuilder) {
        throw new Error(`Fallback not found for signal type: ${selectedSignal.type}`);
    }

    return {
        ...fallbackBuilder(selectedSignal.data),
        isFallback: true,
        fallbackReason: error?.message ?? "Agent execution failed",
        modelUsed: "rule-based"
    };
};
