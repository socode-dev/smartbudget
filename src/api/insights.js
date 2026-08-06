export const runInsightPipeline = async ({ userId, currency, isDemo = false } = {}) => {
    const response = await fetch("/api/insights/run", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, currency, isDemo }),
    });

    const data = await response.json();
        
    if (!response.ok) {
        const error = new Error(data?.message || "Insight pipeline failed.");
        error.code = data?.error || "INSIGHT_PIPELINE_FAILED"
        throw error;
    }

    return data;
}