import { generateAIResponse } from "./aiClient.js";
import {selectModel} from "../shared/modelRouter.js";
import { buildCashflowPrompt } from "../prompts/cashflow.js";
import { fallback } from "../fallbacks/cashflow.js";

export const runCashflowService = async ({data, userId, isDemo = false} = {}) => {
  const prompt = buildCashflowPrompt({ cashflowData: data });
  const ruleBasedInsight = fallback({ cashflowData: data });
  
  let primaryFailed = false;
  let response;
  
  try {
    const model = selectModel({isDemo, primaryFailed: false});
    response = await generateAIResponse({ prompt, model, type: "cashflow" });

      return insightData(data, response, model);

  } catch (primaryErr) {
    
    try {
      const fallbackModel = selectModel({isDemo, primaryFailed: true});
      response = await generateAIResponse({ prompt, model: fallbackModel, type: "cashflow" });

      return insightData(data, response, fallbackModel);
    
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