import { buildFinancialRiskPrompt } from "../financial-risk/promptBuilder";
import { fallback } from "../financial-risk/fallbackInsight";
import {generateAIResponse} from "./aiClient";
import {selectModel, MODEL_CONFIG} from "./modelRouter";
import useInsightsStore from "../../store/useInsightsStore";
import { serverTimestamp } from "firebase/firestore";

export const runFinancialRiskAgent = async (data, userId, {isDemo = false} = {}) => {
    const {setAILimitReached} = useInsightsStore.getState();
    const prompt = buildFinancialRiskPrompt(data);
    const ruleBasedInsight = fallback(data);

    let primaryFailed = false;
    let model;
    let response;
    
    const insightData = {
        id: data.id,
        type: "financial-risk",
        actionType: "suggestion",
        createdAt: serverTimestamp(),
        severity: data.risk.level,
        score: data.risk.score,
        month: data.period.month,
        year: data.period.year
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
            
            if(fallbackError.code === "AI_LIMIT_REACHED") {
                setAILimitReached(true);
            }
            
            return {
                ...ruleBasedInsight,
                modelUsed: "rule-based"
            }
        };

    }
} 
