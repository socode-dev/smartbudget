import { trackBusinessEvent } from "../api/businessTelemetry";
import { updateDocument } from "../firebase/firestore";

export const markInsightViewed = async ({ userId, insight, surface }) => {
    if (!userId || !insight?.id || insight.firstViewedAtMs) return;

    const viewedAtMs = Date.now();

    const insightStatus = insight.status === "ACTIVE" ? "VIEWED" : insight.status;

    try {
        const result = await updateDocument(userId, "insights", insight.id, {
            status: insightStatus,
            firstViewedAtMs: viewedAtMs,
        });

        if (!result.ok) {
            console.error("Failed to update insight status to VIEWED");
            throw new Error("Failed to update insight status to VIEWED");
        }
        
        void trackBusinessEvent({
            userId, 
            eventType: "insight_viewed",
            insightId: insight.id,
            insightType: insight.type,
            severity: insight.severity,
            surface, 
        }).catch((err) => {
            console.error("Insight telemetry failed:", err)
            throw err;
        });
    } catch (err) {
        console.error("Error changing insight status to VIEWED:", err);
        throw err
    }

};
