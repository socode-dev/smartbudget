export const fetchInsight = async ({ userId, riskData, anomalies, budgetComplianceList, cashflowData }) => {
    const baseUrl = import.meta.env.PROD ? "" : "http://localhost:3002";
    // const controller = new AbortController();
    // const timeoutId = setTimeout(() => controller.abort(), 5000);
    // console.log({anomalies, budgetComplianceList, cashflowData, riskData});

    try {
        const response = await fetch(`${baseUrl}/api/ai/orchestrator`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId, riskData, anomalies, budgetComplianceList, cashflowData, isDemo: false}),
            // signal: controller.signal
        });
        
        // clearTimeout(timeoutId);
        
        const contentType = response.headers.get("content-type") || "";
        const resData = contentType.includes("application/json")
            ? await response.json()
            : null;

        if(!response.ok) {
            const error = new Error(resData?.message || "API request failed");
            error.code = resData?.error || "API_REQUEST_FAILED";
            throw error;
        }

        return resData ?? [];

    } catch(err) {
        console.error("API CALL ERROR:", err)
        throw err;
    }
}
