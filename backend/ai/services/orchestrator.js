import { normalizeSignals } from "../orchestrator/normalizeSignals.js";
import {persistInsights} from "../orchestrator/persistInsights.js";
import {scoreSignals} from "../orchestrator/scoreSignals.js"
import { evaluateAttentionGate } from "../orchestrator/attentionGate.js";
import { saveAttentionState } from "../orchestrator/attentionState.js";
import { runAgentWithFallback } from "../orchestrator/agentExecution.js";
import {
    filterEligibleSignals,
    markSignalTriggered,
    markSignalTriggerFailed,
} from "../orchestrator/triggerGate.js";
import { reserveSelectedSignal } from "../orchestrator/reserveSignal.js";
import {
    buildTelemetryContext,
    createTelemetryRunId,
    logAIPipelineRun,
    logInsightEvent
} from "../telemetry/logger.js"

import {runAnomalyService} from "./anomaly.js";
import {runBudgetService} from "./budget.js";
import {runCashflowService} from "./cashflow.js";
import {runRiskService} from "./risk.js";
import { logBusinessEvent } from "../telemetry/businessLogger.js";

const AGENT_MAP = {
    anomaly: runAnomalyService,
    budget: runBudgetService,
    cashflow: runCashflowService,
    "financial-risk": runRiskService,
}

export const runOrchestrator = async ({
    userId,
    institutionId = null,
    pilotId = null,
    cohortId = null,
    dataSource = null,
    enrollmentSource = null,
    anomalies,
    budgetComplianceList,
    cashflowData,
    riskData,
    isDemo
 }) => {
    const runId = createTelemetryRunId();
    const startedAtMs = Date.now();

    const telemetryContext = buildTelemetryContext({
        userId, 
        institutionId,
        pilotId,
        cohortId,
        isDemo
    })

    const rawSignals = normalizeSignals({
        anomalies, 
        budgetComplianceList, 
        cashflowData, 
        riskData
    });

    if(!rawSignals.length) {
        await logAIPipelineRun({
            ...telemetryContext,
            userId,
            runId,
            status: "blocked",
            reason: "NO_RAW_SIGNALS",
            durationMs: Date.now() - startedAtMs,
            rawSignalCount: 0,
            scoredSignalCount: 0,
            attentionAllowed: false,
            persisted: false,
        });

        return [];
    };

    const scoredSignals = scoreSignals({signals: rawSignals});
    const topSignal = scoredSignals[0];

    const attentionDecision = await evaluateAttentionGate({
        userId,
        topSignal,
        scoredSignals
    });

    if(!attentionDecision.allowed) {
        await logAIPipelineRun({
            ...telemetryContext,
            userId,
            runId,
            status: "blocked",
            reason: attentionDecision.reason,
            durationMs: Date.now() - startedAtMs,

            rawSignalCount: rawSignals.length,
            scoredSignalCount: scoredSignals.length,
            topSignalType: topSignal?.type ?? null,
            topSignalId: topSignal?.id ?? null,
            topSignalScore: topSignal?.urgencyScore ?? null,

            attentionAllowed: false,
            attentionReason: attentionDecision.reason,

            persisted: false,
        })

        return {
            insight: null,
            scoredSignals,
            reason: attentionDecision.reason
        };
    }

    const selectedCandidate = scoredSignals.find(signal => signal.id === attentionDecision.signalId) || topSignal;
    const eligibleSignals = await filterEligibleSignals({userId, signals: [selectedCandidate]});

    if(!eligibleSignals.length) {
        await logAIPipelineRun({
            ...telemetryContext,
            userId,
            runId, 
            status: "blocked",
            reason: "NO_ELIGIBLE_SIGNAL",
            durationMs: Date.now() - startedAtMs,

            rawSignalCount: rawSignals.length,
            scoredSignalCount: scoredSignals.length,
            topSignalType: topSignal?.type ?? null,
            topSignalId: topSignal?.id ?? null,
            topSignalScore: topSignal?.urgencyScore ?? null,
            
            selectedSignalType: selectedCandidate?.type ?? null,
            selectedSignalId: selectedCandidate?.id ?? null,

            attentionAllowed: true,
            attentionReason: attentionDecision.reason,

            triggerEligible: false,
            persisted: false,
        });

        return {
            insight: null,
            reason: "NO_ELIGIBLE_SIGNAL"
        }
    } ;

    let selectedSignal = eligibleSignals[0];

    if(!selectedSignal) {
        return {
            insight: null,
            reason: "NO_SELECTED_SIGNAL"
        }
    };

    const reservedSelection = await reserveSelectedSignal({
        userId,
        selectedSignal,
        candidateSignals: eligibleSignals
    });

    if(!reservedSelection) {
        await logAIPipelineRun({
            ...telemetryContext,
            userId,
            runId,
            status: "blocked",
            reason: "NO_RESERVED_SELECTION",
            durationMs: Date.now() - startedAtMs,

            rawSignalCount: rawSignals.length,
            scoredSignalCount: scoredSignals.length,
            topSignalType: topSignal?.type ?? null,
            topSignalId: topSignal?.id ?? null,
            topSignalScore: topSignal?.urgencyScore ?? null,

            selectedSignalType: selectedSignal?.type ?? null,
            selectedSignalId: selectedSignal?.id ?? null,

            attentionAllowed: true,
            attentionReason: attentionDecision.reason,

            triggerEligible: true,
            reservationAllowed: false,
            persisted: false,
        });

        return {
            insight: null,
            reason: "NO_RESERVED_SELECTION"
        }
    };

    selectedSignal = reservedSelection;

    const agent = AGENT_MAP[selectedSignal.type];

    if(!agent) {
        return {
            insight: null,
            reason: "SPECIALISED_AGENT_NOT_FOUND"
        }
    };

    let insight;

    try {
        insight = await runAgentWithFallback({
            agent,
            selectedSignal,
            userId,
            isDemo,
            runId,
            telemetryContext
        });
    } catch (fallbackExecutionError) {
        await markSignalTriggerFailed({userId, signal: selectedSignal, error: fallbackExecutionError});
        return {
            insight: null,
            reason: "FALLBACK_EXECUTION_FAILED"
        }
    };

    if(!insight) {
        await markSignalTriggerFailed({
            userId,
            signal: selectedSignal,
            error: new Error("Agent returned no insight")
        });

        return {
            insight: null, 
            reason: "AGENT_RETURNED_NO_INSIGHT"
        };
    }

    const persistenceResult = await persistInsights({userId, insight});

    const persisted = Boolean(persistenceResult?.persisted);
    const insightId = persistenceResult?.insightId ?? null;
    
    if(!persisted) {
        await logAIPipelineRun({
            ...telemetryContext,
            userId, 
            runId,
            status: "failed",
            reason: "INSIGHT_PERSISTENCE_FAILED",
            durationMs: Date.now() - startedAtMs,

            rawSignalCount: rawSignals.length,
            scoredSignalCount: scoredSignals.length,
            topSignalType: topSignal?.type ?? null,
            topSignalId: topSignal?.id ?? null,
            topSignalScore: topSignal?.urgencyScore ?? null,

            selectedSignalType: selectedSignal?.type ?? null,
            selectedSignalId: selectedSignal?.id ?? null,
            
            
            attentionAllowed: true,
            attentionReason: attentionDecision.reason,
            
            triggerEligible: true,
            reservationAllowed: true,
            
            persisted: false,
            usedFallback: Boolean(insight?.isFallback),
            insightId,
            insightType: insight?.type ?? null,
            severity: insight?.severity ?? selectedSignal?.severity ?? null,
            
            
            error: new Error("Insight persistence failed"),
        });
        
        await logBusinessEvent({
            ...telemetryContext,
            userId,
            eventType: "insight_generated",
            insightId,
            insightType: insight?.type ?? null,
            severity: insight?.severity ?? selectedSignal?.severity ?? null,
            source: "backend",
            dataSource,
            enrollmentSource,
            metadata: {
                selectedSignalId: selectedSignal?.id ?? null,
                selectedSignalType: selectedSignal?.type ?? null
            },
        });

        await markSignalTriggerFailed({
            userId,
            signal: selectedSignal,
            error: new Error("Insight persistence failed")
        });

        return {
            insight: insight || null,
            reason: "INSIGHT_PERSISTENCE_FAILED"
        };
    }

    await logInsightEvent({
        ...telemetryContext,
        userId,
        runId,
        eventType: "INSIGHT_GENERATED",
        insightId,
        insightType: insight?.type ?? null,
        selectedSignalId: selectedSignal?.id ?? null,
        selectedSignalType: selectedSignal?.type ?? null,
        severity: insight.severity ?? selectedSignal?.severity ?? null,
        isFallback: Boolean(insight?.isFallback),
        modelUsed: insight?.modelUsed ?? null,
        reason: attentionDecision.reason,
    });

    await markSignalTriggered({userId, signal: selectedSignal, insight});
    await saveAttentionState({userId, signal: selectedSignal, scoredSignals, insight});

    await logAIPipelineRun({
        ...telemetryContext,
        userId,
        runId,
        status: insight?.isFallback ? "fallback" :"success",
        reason: attentionDecision.reason,
        durationMs: Date.now() - startedAtMs,

        rawSignalCount: rawSignals.length,
        scoredSignalCount: scoredSignals.length,
        topSignalType: topSignal?.type ?? null,
        topSignalId: topSignal?.id ?? null,
        topSignalScore: topSignal?.urgencyScore ?? null,

        selectedSignalType: selectedSignal?.type ?? null,
        selectedSignalId: selectedSignal?.id ?? null, 

        attentionAllowed: true,
        attentionReason: attentionDecision.reason,

        triggerEligible: true,
        reservationAllowed: true,

        persisted: true,
        usedFallback: Boolean(insight?.isFallback),
        insightId,
        insightType: insight?.type ?? null,
        severity: insight?.severity ?? selectedSignal?.severity ?? null,
    });

    return {insight, scoredSignals, reason: attentionDecision.reason};
}
