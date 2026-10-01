import { logBusinessEvent } from "../../backend/ai/telemetry/businessLogger.js";
import { recordCustomerActiveTelemetry } from "../../backend/ai/telemetry/businessBehaviourTelemetry.js";
import { loadPilotContext } from "../../backend/userData/loadPilotContext.js";
import { requireUser, sendUserAuthError } from "../../backend/auth/requireUser.js";

export default async function handler(req, res) {
    if(req.method !== "POST") {
        return res.status(405).json({ 
            ok: false,
            error: "METHOD_NOT_ALLOWED"
        });
    }

    const {
        userId,
        eventType,
        insightId = null,
        insightType = null,
        severity = null,
        surface = null,
        metadata = {},
    } = req.body || {};

    if (!userId || !eventType) {
        return res.status(400).json({ 
            ok: false,
            error: "MISSING_REQUIRED_FIELDS" 
        });
    }

    const authResult = await requireUser(req, userId);
    if (!authResult.ok) return sendUserAuthError(res, authResult);

    try {
        const pilotContext = await loadPilotContext({ userId });

        if (eventType === "customer_active") {
            const activity = await recordCustomerActiveTelemetry({
                userId,
                ...pilotContext,
                surface,
            });

            if (!activity.ok) {
                return res.status(503).json({
                    ok: false,
                    error: "BUSINESS_TELEMETRY_WRITE_FAILED",
                });
            }

            return res.status(200).json({
                ok: true,
                recorded: activity.recorded,
            });
        }

        const logged = await logBusinessEvent({
            userId,
            eventType,
            ...pilotContext,
            source: "frontend",
            insightId,
            insightType,
            severity,
            surface,
            metadata,
        });

        if (!logged) {
            return res.status(503).json({
                ok: false,
                error: "BUSINESS_TELEMETRY_WRITE_FAILED"
            });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("BUSINESS_TELEMETRY_FAILED:", err);

        return res.status(200).json({ 
            ok: false, 
            error: "BUSINESS_TELEMETRY_FAILED" 
        });
    }
}
