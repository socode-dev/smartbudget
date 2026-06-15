import { buildFinancialRiskPrompt } from "../prompts/risk.js"
import { riskFallback } from "../fallbacks/risk.js";
import { generateAIResponse } from "./aiClient.js";
import { selectModel } from "../shared/modelRouter.js";

export const runRiskService = async ({data, userId, isDemo} = {}) => {
    const prompt = buildFinancialRiskPrompt({riskData: data});
    const ruleBasedInsight = riskFallback({riskData: data});

    let primaryFailed = false;
    let model;
    let response;
    
    try {
        model = selectModel({isDemo, primaryFailed: false});
        response = await generateAIResponse({prompt, model, type: "financial-risk"});
        
        return insightData(data, response, model)
        
    } catch(err) {
        
        try {
            model = selectModel({isDemo, primaryFailed: true});
            response = await generateAIResponse({prompt, model, type: "financial-risk"});

            return insightData(data, response, model);

        } catch (fallbackError) {
            
            return {
                ...ruleBasedInsight,
                modelUsed: "rule-based"
            }
        };

    }
} 


const insightData = (data, response, model) => {

    return {
        id: data.id,
        type: "financial-risk",
        actionType: "suggestion",
        severity: data.risk.level,
        score: data.risk.score,
        month: data.period.month,
        year: data.period.year,
        agent: response,
        modelUsed: model
    }
} 