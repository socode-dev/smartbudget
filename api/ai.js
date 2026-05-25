import { consumeQuota } from "../lib/quota.js";
import {runFinancialRiskAgent} from "../backend/ai/agents/financialRiskAgent.js"
import {runAnomalyAgent} from "../backend/ai/agents/anomalyAgent.js";
import {runBudgetAgent} from "../backend/ai/agents/budgetAgent.js";
import {runCashflowAgent} from "../backend/ai/agents/cashflowAgent.js"

export default async function handler(req, res) {
const {userId, riskData, anomalies, budgetComplianceList, cashflowData, isDemo} = req.body;

  if(!userId) {
    return res.status(400).json({error: "Missing userId"})
  }

  try {

    const insights = [];

    const DEV_USER_ID = process.env.DEV_USER_ID;
  
    let quota = {allowed: true};
    
    if(userId !== DEV_USER_ID) {
    quota = await consumeQuota(userId); 
    }
  
    if (!quota.allowed) {
      return res.status(403).json({
        error: "AI_LIMIT_REACHED",
        message: "You've used all your free AI Insights."
      });
    }
    
    if(anomalies.length) {
      for(const anomaly of anomalies) {
        const anomalyInsight = await runAnomalyAgent({anomaly, userId, isDemo});
        
        insights.push(anomalyInsight);
      }
    }
    
    if(budgetComplianceList.length) {
      for(const complianceData of budgetComplianceList) {
        const budgetInsight = await runBudgetAgent({complianceData, userId, isDemo});
        
        insights.push(budgetInsight);
      }
    }
    
    if(cashflowData) {
      const cashflowInsight = await runCashflowAgent({cashflowData, userId, isDemo});
      
      insights.push(cashflowInsight);
    }
    
    if(riskData) {
      const riskInsight = await runRiskAgent({riskData, userId, isDemo});

      insights.push(riskInsight);
    }
    

    return res.status(200).json({insights});

  } catch (error) {
    return res.status(500).json({error: "AI_PIPELINE_FAILED", message: error.message})
  }

}
