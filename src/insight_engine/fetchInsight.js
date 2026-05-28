import { data } from "currency-codes";

export const fetchInsight = async ({ userId, riskData, anomalies, budgetComplianceList, cashflowData }) => {
    const baseUrl = import.meta.env.PROD ? "" : "http://localhost:3002";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`${baseUrl}/api/ai`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId, riskData, anomalies, budgetComplianceList, cashflowData, isDemo: false}),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const resData = await response.json();

        if(!response.ok) {
            const error = new Error(resData.message || "API request failed")
            error.code = resData.error;
            throw error;
        }

        return resData.insights;

    } catch(err) {
        console.error("API CALL ERROR:", err)
    }
}