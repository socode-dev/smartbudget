import { normalizeSignals } from "../orchestrator/normalizeSignals.js";
import { buildOrchestrationPrompt } from "../prompts/orchestrator.js";
import { generateAIResponse } from "./aiClient.js";
import {validateDecision} from "../orchestrator/validateDecision.js";
import {fallback} from "../fallbacks/orchestratorSelection.js";
import {persistInsights} from "../orchestrator/persistInsights.js";
import {scoreSignals} from "../orchestrator/scoreSignals.js"
import {selectModel} from "../shared/modelRouter.js";
import {
    checkSignalEligibility,
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

    if (await isTopSignalAlreadyFired({userId, signal: scoredSignals[0]})) {
        return {scoredSignals};
    }

    const eligibleSignals = await filterEligibleSignals({userId, signals: scoredSignals});

    if(!eligibleSignals.length) return [];

    const topCandidateSignals = eligibleSignals.slice(0, 5);

    const prompt = buildOrchestrationPrompt({signals: topCandidateSignals});

    let decision = null;
    let model;

    try {
        model = selectModel({isDemo, primaryFailed: false})
        decision = await generateAIResponse({prompt, model, type: "orchestrator"})
    } catch(err) {
        throw new Error("ORCHESTRATOR_LLM_FAILED");
    }
    
    const isValid = validateDecision({decision, signals: topCandidateSignals });
    
    let selectedSignal;

    if(isValid) {
        selectedSignal = topCandidateSignals.find(signal => signal.id === decision.selectedSignalId);
    }

    if(!selectedSignal) {
        selectedSignal = fallback({signals: topCandidateSignals});
    }

    if(!selectedSignal) return [];

    const reservedSelection = await reserveSelectedSignal({
        userId,
        selectedSignal,
        candidateSignals: topCandidateSignals
    });

    if(!reservedSelection) return [];

    selectedSignal = reservedSelection;

    const agent = AGENT_MAP[selectedSignal.type];

    if(!agent) return [];

    let insight;

    try {
        insight = await agent({data: selectedSignal.data, userId, isDemo});
    } catch (agentExecutionError) {
        await markSignalTriggerFailed({userId, signal: selectedSignal, error: agentExecutionError});
        return []
    };

    if(!insight) {
        await markSignalTriggerFailed({
            userId,
            signal: selectedSignal,
            error: new Error("Agent returned no insight")
        });

        return [];
    }

    const persisted = await persistInsights({userId, insight});

    if(!persisted) {
        await markSignalTriggerFailed({
            userId,
            signal: selectedSignal,
            error: new Error("Insight persistence failed")
        });

        return [];
    }

    await markSignalTriggered({userId, signal: selectedSignal, insight});

    return insight;
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

const isTopSignalAlreadyFired = async ({userId, signal} = {}) => {
    if (!userId || !signal?.type) return false;

    const eligibility = await checkSignalEligibility({userId, signal});
    return eligibility.allowed === false && eligibility.reason === "ALREADY_FIRED";
}
