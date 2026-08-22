export const trackBusinessEvent = async ({
    userId,
    eventType,
    insightId = null,
    insightType = null,
    severity = null,
    surface = null,
    metadata = {}
} = {}) => {
    if (!userId || !eventType) return false;

    try {
        const response = await fetch("/api/telemetry/business", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                eventType,
                insightId,
                insightType,
                severity,
                surface,
                metadata,
            }),
        });

        const body = await response.json().catch(() => null);

        if (!response.ok || body?.ok !== true) {
            throw new Error(body?.error || "BUSINESS_TELEMETRY_FAILED");
        }

        return true
    } catch(err) {
        console.error("Error calling business metric fetch:", err)
        return false
    }
};