import { buildFinancialRiskPrompt } from "../prompts/risk.js"
import { riskFallback } from "../fallbacks/risk.js";
import { generateAIResponse } from "./aiClient.js";
import { selectModel } from "./modelRouter.js";

export const runRiskAgent = async ({riskData, userId, isDemo} = {}) => {
    const prompt = buildFinancialRiskPrompt({riskData});
    const ruleBasedInsight = riskFallback({riskData});

    let primaryFailed = false;
    let model;
    let response;
    
    const insightData = {
        id: riskData.id,
        type: "financial-risk",
        actionType: "suggestion",
        severity: riskData.risk.level,
        score: riskData.risk.score,
        month: riskData.period.month,
        year: riskData.period.year
    }
    
    try {
        model = selectModel({isDemo, primaryFailed: false});
        response = await generateAIResponse({prompt, model, userId});
        
        return {
            ...insightData,
            agent: response,
            modelUsed: model
        }
        
    } catch(err) {
        
        try {
            model = selectModel({isDemo, primaryFailed: true});
            response = await generateAIResponse({prompt, model, userId});

            return {
                ...insightData,
                agent: response,
                modelUsed: model
            }

        } catch (fallbackError) {
            
            return {
                ...ruleBasedInsight,
                modelUsed: "rule-based"
            }
        };

    }
} 
