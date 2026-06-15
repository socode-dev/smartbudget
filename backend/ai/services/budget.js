import { generateAIResponse } from "./aiClient.js";
import {selectModel} from "../shared/modelRouter.js";
import { buildBudgetCompliancePrompt } from "../prompts/budget.js";
import { fallback } from "../fallbacks/budget.js";

export const runBudgetService = async ({ data, userId, isDemo} = {}) => {

  const prompt = buildBudgetCompliancePrompt({complianceData: data});
  const ruleBasedInsight = fallback({complianceData: data});
  
  let response;
  let model;
  
  try {
    model = selectModel({isDemo, primaryFailed: false});
    response = await generateAIResponse({ prompt, model, type: "budget" });

      return insightData(data, response, model);

  } catch (primaryErr) {
    
    try {
      model = selectModel({isDemo, primaryFailed: true});
      const response = await generateAIResponse({ prompt, model: model, type: "budget" });

      return insightData(data, response, model);
    } catch (fallbackError) {

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