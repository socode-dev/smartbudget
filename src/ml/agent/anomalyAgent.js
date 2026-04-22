import { buildAnomalyPrompt } from "./promptBuilder";
import { generateAIResponse } from "./aiClient";
import {selectModel, MODEL_CONFIG} from "./modelRouter";
import {fallbackInsight} from "./fallback";
import useInsightsStore from "../../store/useInsightsStore";

export const runAnomalyAgent = async (anomaly, userId, {isDemo = false} = {}) => {
  const {setAILimitReached} = useInsightsStore.getState();
  const prompt = buildAnomalyPrompt(anomaly);
  const ruleBasedInsight = fallbackInsight(anomaly)
  
  let primaryFailed = false;
  let response;
  
  try {
    const model = selectModel({isDemo, primaryFailed: false});
    response = await generateAIResponse({ prompt, model, userId });
    

      return {
      id: anomaly.id,
      type: "anomaly",
      actionType: "suggestion",
      createdAt: new Date(),
      severity: anomaly.risk.level,
      baselineValue: anomaly.signal.baseline_value,
      category: anomaly.category,
      month: anomaly.signal.month,
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
      month: anomaly.signal.month,
      year: new Date().getFullYear(),
      baselineValue: anomaly.signal.baseline_value,
      agent: response,
      modelUsed: fallbackModel
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
};
