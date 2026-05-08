import { generateAIResponse } from "./aiClient";
import {selectModel, MODEL_CONFIG} from "./modelRouter";
import useInsightsStore from "../../store/useInsightsStore";
import { buildCashFlowAgentPrompt } from "../forecast/promptBuilder";
import { fallback } from "../forecast/fallbackInsight";

export const runCashFlowAgent = async (cashFlowData, userId, {isDemo = false} = {}) => {
  const {setAILimitReached} = useInsightsStore.getState();
  const prompt = buildCashFlowAgentPrompt(cashFlowData);
  const ruleBasedInsight = fallback(cashFlowData);
  
  let primaryFailed = false;
  let response;
  
  try {
    const model = selectModel({isDemo, primaryFailed: false});
    response = await generateAIResponse({ prompt, model, userId });

      return insightData(cashFlowData, response, model);

  } catch (primaryErr) {
    
    try {
      const fallbackModel = selectModel({isDemo, primaryFailed: true});
      const response = await generateAIResponse({ prompt, model: fallbackModel, userId });

      return insightData(cashFlowData, response, fallbackModel);
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


const insightData = (cashFlowData, response, model) => {
  let riskLevel;

    switch (cashFlowData.outcome) {
        case "RISK":
            riskLevel = "HIGH";
            break;
        case "WARNING":
            riskLevel = "MEDIUM";
        default:
            riskLevel = "LOW";
    }

  return {
    id: cashFlowData.id,
      type: "cash-flow-forecast",
      actionType: "suggestion",
      createdAt: new Date(),
      category: null,
      severity: riskLevel,
      month: cashFlowData.period.month,
      year: cashFlowData.period.year,
      agent: response,
      modelUsed: model
  }
}