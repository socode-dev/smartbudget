import { consumeQuota } from "../../lib/quota.js";
import { runOrchestrator } from "../../backend/ai/services/orchestrator.js"
import { requireUser, sendUserAuthError } from "../../backend/auth/requireUser.js";

export default async function handler(req, res) {
const {userId, riskData, anomalies, budgetComplianceList, cashflowData, isDemo} = req.body;

  if(!userId) {
    return res.status(400).json({error: "Missing userId"})
  }

  const authResult = await requireUser(req, userId);
  if (!authResult.ok) return sendUserAuthError(res, authResult);

  try {

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
    
    const insights = await runOrchestrator({userId, anomalies, budgetComplianceList, cashflowData, riskData, isDemo});

    return res.status(200).json({...insights});

  } catch (error) {
    return res.status(500).json({error: "AI_PIPELINE_FAILED", message: error.message})
  }

}
