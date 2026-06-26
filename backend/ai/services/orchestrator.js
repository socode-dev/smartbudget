import { normalizeSignals } from "../orchestrator/normalizeSignals.js";
import {persistInsights} from "../orchestrator/persistInsights.js";
import {scoreSignals} from "../orchestrator/scoreSignals.js"
import { evaluateAttentionGate } from "../orchestrator/attentionGate.js";
import { saveAttentionState } from "../orchestrator/attentionState.js";
import {
    filterEligibleSignals,
    markSignalTriggered,
    markSignalTriggerFailed,
    reserveSignalTrigger
} from "../orchestrator/triggerGate.js";

import {runAnomalyService} from "./anomaly.js";
import {runBudgetService} from "./budget.js";
import {runCashflowService} from "./cashflow.js";
import {runRiskService} from "./risk.js";

const AGENT_MAP = {
    anomaly: runAnomalyService,
    budget: runBudgetService,
    cashflow: runCashflowService,
    "financial-risk": runRiskService,
}

export const runOrchestrator = async ({
    userId,
    anomalies,
    budgetComplianceList,
    cashflowData,
    riskData,
    isDemo
 }) => {

    const rawSignals = normalizeSignals({
        anomalies, 
        budgetComplianceList, 
        cashflowData, 
        riskData
    });

    if(!rawSignals.length) return [];

    const scoredSignals = scoreSignals({signals: rawSignals});
    const topSignal = scoredSignals[0];

    const attentionDecision = await evaluateAttentionGate({
        userId,
        topSignal,
        scoredSignals
    });

    if(!attentionDecision.allowed) {
        return {
            insight: null,
            scoredSignals,
            reason: attentionDecision.reason
        };
    }

    const selectedCandidate = scoredSignals.find(signal => signal.id === attentionDecision.signalId) || topSignal;
    const eligibleSignals = await filterEligibleSignals({userId, signals: [selectedCandidate]});

    if(!eligibleSignals.length) {
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
        insight = await agent({data: selectedSignal.data, userId, isDemo});
    } catch (agentExecutionError) {
        await markSignalTriggerFailed({userId, signal: selectedSignal, error: agentExecutionError});
        return {
            insight: null,
            reason: "AGENT_EXECUTION_FAILED"
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

    const persisted = await persistInsights({userId, insight});

    if(!persisted) {
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

    await markSignalTriggered({userId, signal: selectedSignal, insight});
    await saveAttentionState({userId, signal: selectedSignal, scoredSignals, insight});

    return {insight, scoredSignals, reason: attentionDecision.reason};
}

const reserveSelectedSignal = async ({userId, selectedSignal, candidateSignals}) => {
    const orderedSignals = [
        selectedSignal,
        ...candidateSignals.filter(signal => signal.id !== selectedSignal.id)
    ];

    for (const signal of orderedSignals) {
        const reservation = await reserveSignalTrigger({userId, signal});

        if(reservation.allowed) {
            return signal;
        }
    }

    return null;
}
