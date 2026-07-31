import { fallback as anomalyFallback } from "../fallbacks/anomaly.js";
import { fallback as budgetFallback } from "../fallbacks/budget.js";
import { fallback as cashflowFallback } from "../fallbacks/cashflow.js";
import { riskFallback } from "../fallbacks/risk.js";
import { logAIAgentRun } from "../telemetry/logger.js";

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
    runId,
    telemetryContext = {},
    timeoutMs = AGENT_TIMEOUT_MS
}) => {
    const startedAtMs = Date.now();

    try {
        const insight = await runAgentWithTimeout({
            agent,
            selectedSignal,
            userId,
            isDemo,
            timeoutMs
        });

        await logAIAgentRun({
            ...telemetryContext,
            userId,
            runId,
            agentType: selectedSignal.type,
            selectedSignalId: selectedSignal.id,
            durationMs: Date.now() - startedAtMs,
            status: "success",
            timedOut: false,
            schemaValid: true,
            usedFallback: false,
            modelUsed: insight?.modelUsed ?? null,
        });

        return insight;
    } catch (agentExecutionError) {

        const fallbackInsight = buildFallbackInsight({
            selectedSignal,
            error: agentExecutionError
        });

        await logAIAgentRun({
            ...telemetryContext,
            userId,
            runId,
            agentType: selectedSignal.type,
            selectedSignalId: selectedSignal.id,
            durationMs: Date.now() - startedAtMs,
            status: "fallback",
            timedOut: agentExecutionError.code === "AI_PROVIDER_TIMEOUT",
            schemaValid: agentExecutionError.code === "AI_OUTPUT_MALFORMED" ? false : null,
            usedFallback: true,
            fallbackReason: agentExecutionError.message ?? "Agent execution failed",
            modelUsed: fallbackInsight?.modelUsed ?? "rule-based",
            error: agentExecutionError,
        });

        return fallbackInsight;
    }
};

const runAgentWithTimeout = async ({ agent, selectedSignal, userId, isDemo, timeoutMs }) => {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            const error = new Error("AI provider timed out");
            error.code = "AI_PROVIDER_TIMEOUT"
            reject(error);
        }, timeoutMs);
    });

    try {
        const insight = await Promise.race([
            agent({ data: selectedSignal.data, userId, isDemo }),
            timeoutPromise
        ]);

        if (!isValidInsight(insight)) {
            const error = new Error("AI output malformed");
            error.code = "AI_OUTPUT_MALFORMED";
            throw error;
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
