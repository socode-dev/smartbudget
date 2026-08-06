import { loadFinancialData } from "../../backend/userData/loadFinancialData.js";
import { runFinancialSignals } from "../../backend/financial-signals/runFinancialSignals.js";
import { runOrchestrator } from "../../backend/ai/services/orchestrator.js";

export default async function handler(req, res) {
    if(req.method !== "POST") {
        return res.status(405).json({
            error: "METHOD_NOT_ALLOWED",
            message: "Only post request are supported."
        });
    }

    const { userId, currency, isDemo = false } = req.body || {};

    if (!userId) {
        return res.status(400).json({
            error: "MISSING_USER_ID",
            message: "Missing userId"
        });
    }

    try {
        const { transactions, budgets } = await loadFinancialData({ userId });

        const { anomalies, budgetComplianceList, cashflowData, riskData } = runFinancialSignals({
            transactions,
            budgets,
            currency
        });

        const result = await runOrchestrator({ 
            userId, 
            anomalies, 
            budgetComplianceList, 
            cashflowData, 
            riskData, 
            isDemo 
        });

        return res.status(200).json({
            ...result
        })
    } catch (err) {
        console.error("INSIGHT_RUN_FAILED:", err);

        return res.status(500).json({
            error: "INSIGHT_RUN_FAILED",
            message: err.message || "Insight pipeline failed"
        });
    }
}
