import { randomUUID } from "crypto";
import { writeTelemetryEvent } from "./writeTelemetryEvent.js";

export const createTelemetryRunId = () => `run_${randomUUID()}`;

export const buildTelemetryContext = ({
    userId,
    institutionId = null,
    pilotId = null,
    cohortId = null,
    isDemo = false,
    environment = process.env.NODE_ENV || "development"
} = {}) => {
    return {
        userId,
        institutionId,
        pilotId,
        cohortId,
        isDemo: Boolean(isDemo),
        environment
    }
};


export const logAIPipelineRun = async ({
    userId,
    runId,
    institutionId = null,
    pilotId = null,
    cohortId = null,
    environment = process.env.NODE_ENV || "development",
    isDemo = false,

    status,
    reason = null,
    durationMs = null,

    rawSignalCount = 0,
    scoredSignalCount = 0,
    topSignalType = null,
    topSignalId = null,
    topSignalScore = null,

    selectedSignalType = null,
    selectedSignalId = null,

    attentionAllowed = null,
    attentionReason = null,

    triggerEligible = null,
    reservationAllowed = null,
    reservationReason = null,

    persisted = null,
    usedFallback = false,
    insightId = null,
    insightType = null,
    severity = null,

    error = null,
} = {}) => {
    return writeTelemetryEvent({
        userId,
        category: "aiPipelineRuns",
        eventId: runId,
        payload: {
            runId,
            institutionId,
            pilotId,
            cohortId,
            environment,
            isDemo,

            status,
            reason,
            durationMs,

            rawSignalCount,
            scoredSignalCount,
            topSignalType,
            topSignalId,
            topSignalScore,

            selectedSignalType,
            selectedSignalId,

            attentionAllowed,
            attentionReason,

            triggerEligible,
            reservationAllowed,
            reservationReason,

            persisted,
            usedFallback,
            insightId,
            insightType,
            severity,

            error: serializeTelemetryError(error),
        },
    });
};


export const logAIAgentRun = async ({
    userId,
    runId,
    agentRunId = `agent_${randomUUID()}`,
    institutionId = null,
    pilotId = null,
    cohortId = null,
    environment = process.env.NODE_ENV || "development",
    isDemo = false,

    agentType, 
    selectedSignalId = null,
    durationMs = null,

    status,
    timedOut = false,
    schemaValid = null,
    usedFallback = false,
    fallbackReason = null,
    modelUsed = null,

    error = null,
} = {}) => {
    return writeTelemetryEvent({
        userId,
        category: "aiAgentRuns",
        eventId: agentRunId,
        payload: {
            runId,
            agentRunId,
            institutionId,
            pilotId,
            cohortId,
            environment,
            isDemo,

            agentType,
            selectedSignalId,
            durationMs,

            status,
            timedOut,
            schemaValid,
            usedFallback,
            fallbackReason,
            modelUsed,

            error: serializeTelemetryError(error),
        },
    });
};


export const logInsightEvent = async ({
    userId,
    runId,
    eventId = `insight_event_${randomUUID()}`,
    institutionId = null,
    pilotId = null,
    cohortId = null,
    environment = process.env.NODE_ENV || "development",
    isDemo = false,

    eventType,
    insightId = null,
    insightType = null,
    selectedSignalId = null,
    selectedSignalType = null,
    severity = null,
    isFallback = false,
    modelUsed = null,
    reason = null,
} = {}) => {
    return writeTelemetryEvent ({
        userId,
        category: "insightEvents",
        eventId,
        payload: {
            runId,
            eventId,
            institutionId,
            pilotId,
            cohortId,
            environment,
            isDemo,

            eventType,
            insightId,
            insightType,
            selectedSignalId,
            selectedSignalType,
            severity,
            isFallback,
            modelUsed,
            reason
        },
    });
};


const serializeTelemetryError = error => {
    if (!error) return null;

    return {
        name: error.name ?? "Error",
        message: error.message ?? "Unknown telemetry error",
        code: error.code ?? null,
    }
}