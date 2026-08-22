import { db } from "../../lib/firebaseAdmin.js";
import { logBusinessEvent } from "../../backend/ai/telemetry/businessLogger.js";
import { loadPilotContext } from "../../backend/userData/loadPilotContext.js";

const TERMINAL_STATUSES = new Set(["ACKNOWLEDGED", "DISMISSED", "EXPIRED"]);

const EVENT_BY_STATUS = {
    ACKNOWLEDGED: "insight_acknowledged",
    DISMISSED: "insight_dismissed",
};

const TIMESTAMP_BY_STATUS = {
    ACKNOWLEDGED: "acknowledgedAtMs",
    DISMISSED: "dismissedAtMs",
}
export default async function handler(req, res) {
    if(req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            error: {
                code: "METHOD_NOT_ALLOWED",
                message: "Request failed. Please try again",
            },
        });
    }

    const {
        userId,
        insightId,
        response,
        surface = null,
    } = req.body || {};

    const nextStatus = String(response || "").toUpperCase();

    if (!userId || !insightId || !EVENT_BY_STATUS[nextStatus]) {
        return res.status(400).json({
            ok: false,
            error: {
                code: "INVALID_INSIGHT_RESPONSE",
                message: "Insight response is not valid. Please try again"
            }
        });
    }

    const insightRef = db
    .collection("users")
    .doc(userId)
    .collection("insights")
    .doc(insightId);

    const now = Date.now();

    try {
        const transactionResult = await db.runTransaction(async transaction => {
            const snapshot = await transaction.get(insightRef);

            if (!snapshot.exists) {
                return {
                    ok: false,
                    reason: "INSIGHT_NOT_FOUND",
                };
            }

            const insight = snapshot.data();

            if (TERMINAL_STATUSES.has(insight.status)) {
                return {
                    ok: false,
                    error: {
                        code: "INSIGHT_ALREADY_TERMINAL",
                        message: `Insight has already been ${insight.status.toLowerCase()}`
                    }
                };
            }

            transaction.update(insightRef, {
                status: nextStatus,
                [TIMESTAMP_BY_STATUS[nextStatus]]: now,
            });

            return {
                ok: true,
                insight
            }
        });

        if (!transactionResult.ok) {
            return res.status(409).json(transactionResult);
        }

        const insight = transactionResult.insight;

        const pilotContext = await loadPilotContext({ userId });

        await logBusinessEvent({
            userId,
            ...pilotContext,
            eventType: EVENT_BY_STATUS[nextStatus],
            insightId,
            insightType: insight.type ?? null,
            severity: insight.severity ?? null,
            surface,
        });

        return res.status(200).json({
            ok: true,
            success: {
                code: "INSIGHT_WRITE_SUCCESSFUL",
                message: `You have now ${response === "ACKNOWLEDGED" ? "acknowledged" : "dismissed"} this insight`
            },
        });
    } catch (err) {
        console.error("INSIGHT_RESPONSE_FAILED:", err);

        return res.status(500).json(err)
    }
}