import { generateAIResponse } from "./aiClient.js";
import {selectModel, MODEL_CONFIG} from "./modelRouter.js";
import { buildCashflowAgentPrompt } from "../prompts/cashflow.js";
import { fallback } from "../fallbacks/cashflow.js";

export const runCashflowAgent = async ({cashflowData, userId, isDemo = false} = {}) => {
  const prompt = buildCashflowAgentPrompt({ cashflowData });
  const ruleBasedInsight = fallback({ cashflowData });
  
  let primaryFailed = false;
  let response;
  
  try {
    const model = selectModel({isDemo, primaryFailed: false});
    response = await generateAIResponse({ prompt, model, userId });

      return insightData(cashflowData, response, model);

  } catch (primaryErr) {
    
    try {
      const fallbackModel = selectModel({isDemo, primaryFailed: true});
      response = await generateAIResponse({ prompt, model: fallbackModel, userId });

      return insightData(cashflowData, response, fallbackModel);
    
    } 
    catch (fallbackError) {

        return {
        ...ruleBasedInsight,
        modelUsed: "rule-based"
      }
    }

  }
};


const insightData = (cashflowData, response, model) => {
  let riskLevel;

    switch (cashflowData.outcome) {
        case "RISK":
            riskLevel = "HIGH";
            break;
        case "WARNING":
            riskLevel = "MEDIUM";
            break;
        default:
            riskLevel = "LOW";
    }

  return {
    id: cashflowData.id,
      type: "cashflow",
      actionType: "suggestion",
      createdAt: new Date(),
      category: null,
      severity: riskLevel,
      month: cashflowData.period.month,
      year: cashflowData.period.year,
      agent: response,
      modelUsed: model
  }
}