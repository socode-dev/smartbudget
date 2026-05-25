import { buildAnomalyPrompt } from "../prompts/anomaly.js";
import { generateAIResponse } from "./aiClient.js";
import {selectModel, MODEL_CONFIG} from "./modelRouter.js";
import {fallback} from "../fallbacks/anomaly.js";

export const runAnomalyAgent = async ({anomaly, userId, isDemo} = {}) => {

  const prompt = buildAnomalyPrompt({ anomaly });
  const ruleBasedInsight = fallback({ anomaly })
  
  let primaryFailed = false;
  let response;
  
  try {
    const model = selectModel({isDemo, primaryFailed: false});
    response = await generateAIResponse({ prompt, model, userId });
    

      return {
      id: anomaly.id,
      type: "anomaly",
      actionType: "suggestion",
      severity: anomaly.risk.level,
      baselineValue: anomaly.signal.baseline_value,
      category: anomaly.category,
      year: new Date().getFullYear(),
      agent: response,
      modelUsed: model
      }

  } catch (primaryErr) {

    try {
      const fallbackModel = selectModel({isDemo, primaryFailed: true});
      const response = await generateAIResponse({ prompt, model: fallbackModel, userId });

      return {
      id: anomaly.id,
      type: "anomaly",
      actionType: "suggestion",
      createdAt: new Date(),
      severity: anomaly.risk.level,
      category: anomaly.category,
      year: new Date().getFullYear(),
      baselineValue: anomaly.signal.baseline_value,
      agent: response,
      modelUsed: fallbackModel
      }    
    } catch (fallbackError) {

        return {
        ...ruleBasedInsight,
        modelUsed: "rule-based"
      }
    };

  }
};
