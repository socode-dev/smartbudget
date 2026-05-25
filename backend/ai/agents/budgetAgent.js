import { generateAIResponse } from "./aiClient.js";
import {selectModel, MODEL_CONFIG} from "./modelRouter.js";
import { buildBudgetComplianceAgentPrompt } from "../prompts/budget.js";
import { fallback } from "../fallbacks/budget.js";

export const runBudgetAgent = async ({ complianceData, userId, isDemo} = {}) => {

  const prompt = buildBudgetComplianceAgentPrompt({complianceData});
  const ruleBasedInsight = fallback({complianceData});
  
  let primaryFailed = false;
  let response;
  
  try {
    const model = selectModel({isDemo, primaryFailed: false});
    response = await generateAIResponse({ prompt, model, userId });

      return insightData(complianceData, response, model);

  } catch (primaryErr) {
    
    try {
      const fallbackModel = selectModel({isDemo, primaryFailed: true});
      const response = await generateAIResponse({ prompt, model: fallbackModel, userId });

      return insightData(complianceData, response, fallbackModel);
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
};


const insightData = (data, response, model) => {
  return {
    id: data.id,
      type: "budget-compliance",
      actionType: "suggestion",
      createdAt: new Date(),
      severity: data.derived.risk_level,
      category: data.category,
      year: data.budget.year,
      agent: response,
      modelUsed: model
  }
}