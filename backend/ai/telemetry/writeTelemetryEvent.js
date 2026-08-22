import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { getDateKey, getDailyMetricId, getMetricShardId } from "./utils.js";
import { buildBusinessDailyMetricPatch } from "./businessMetrics.js";
import { queueUniqueCustomerMarker } from "./customerMetrics.js";

const TELEMETRY_ROOT = "telemetry";

export const writeTelemetryEvent  = async ({ userId, category, eventId, payload }) => {
    if (!userId || !category || !eventId) return false;
    
    const now = Date.now();
    const dateKey = getDateKey(now);
    const shardId = getMetricShardId(eventId);

    const eventPayload = {
        ...payload,
        category,
        createdAt: FieldValue.serverTimestamp(),
        createdAtMs: now
    };

    try {
        const batch = db.batch();
    
        const userEventRef = buildUserEventRef({userId, category, eventId});
        batch.set(userEventRef, eventPayload, {merge: true});

        queueUniqueCustomerMarker({
            batch,
            db,
            payload: eventPayload,
            dateKey,
        });

        if(payload?.institutionId) {
            const institutionEventRef = buildInstitutionEventRef({
                institutionId: payload.institutionId,
                category,
                eventId
            });

            batch.set(institutionEventRef, eventPayload, { merge: true });
        };

        queueTelemetryAggregates({
            batch, 
            category,
            payload: eventPayload,
            dateKey,
            shardId,
            now
        });

        await batch.commit();

        return true;
    } catch (err) {
        console.error("TELEMETRY_WRITE_FAILED:", err);
        return false;
    }

};

const buildUserEventRef = ({ userId, category, eventId }) => {
    return db
    .collection("users")
    .doc(userId)
    .collection(TELEMETRY_ROOT)
    .doc(category)
    .collection("events")
    .doc(eventId);
};

const buildInstitutionEventRef = ({ institutionId, category, eventId }) => {
    return db
    .collection("institutions")
    .doc(institutionId)
    .collection(category)
    .doc(eventId);
};

const queueTelemetryAggregates = ({ batch, category, payload, dateKey, shardId, now }) => {
    const dailyMetricPatch = buildDailyMetricPatch({ 
        category,
        payload, 
        dateKey, 
        shardId, 
        now 
    });

    if(!dailyMetricPatch) return null;

    if(payload?.institutionId && payload?.pilotId) {
        const institutionDailyMetricShardRef = buildInstitutionDailyMetricShardRef({ 
            institutionId: payload.institutionId,
            pilotId: payload.pilotId,
            dateKey,
            category,
            shardId,
         });

         batch.set(institutionDailyMetricShardRef, dailyMetricPatch, { merge: true });
    }

    const globalDailyMetricShardRef = buildGlobalDailyMetricShardRef({ 
        dateKey,
        category,
        shardId
    });
    batch.set(globalDailyMetricShardRef, dailyMetricPatch, { merge: true });
};

const buildInstitutionDailyMetricShardRef = ({ institutionId, pilotId, dateKey, category, shardId }) => {
    return db
    .collection("institutions")
    .doc(institutionId)
    .collection("pilots")
    .doc(pilotId)
    .collection("dailyMetrics")
    .doc(getDailyMetricId({dateKey, category}))
    .collection("shards")
    .doc(shardId);
};

const buildGlobalDailyMetricShardRef = ({ dateKey, category, shardId }) => {
    return db
    .collection("globalMetrics")
    .doc("daily")
    .collection("records")
    .doc(getDailyMetricId({dateKey, category}))
    .collection("shards")
    .doc(shardId);
};

const buildDailyMetricPatch = ({ category, payload, dateKey, shardId, now }) => {
    if(category === "aiPipelineRuns") {
        return buildPipelineDailyMetricPatch({ 
            payload, 
            dateKey, 
            shardId, 
            now 
        });
    }
    
    if(category === "aiAgentRuns") {
        return buildAgentDailyMetricPatch({ 
            payload, 
            dateKey, 
            shardId, 
            now 
        });
    }

    if(category === "insightEvents") {
        return buildInsightDailyMetricPatch({ 
            payload, 
            dateKey, 
            shardId, 
            now 
        });
    }

    if (category === "businessEvents") {
        return buildBusinessDailyMetricPatch({
            payload,
            dateKey,
            shardId,
            now
        })
    }

    return null;
}

const buildPipelineDailyMetricPatch = ({ payload, dateKey, shardId, now }) => {
    return {
        dateKey,
        shardId,

        totalPipelineRuns: FieldValue.increment(1),
        successfulPipelineRuns: FieldValue.increment(payload.status === "success" ? 1 : 0),
        fallbackPipelineRuns: FieldValue.increment(payload.status === "fallback" ? 1 : 0),
        failedPipelineRuns: FieldValue.increment(payload.status === "failed" ? 1 : 0),
        blockedPipelineRuns: FieldValue.increment(payload.status === "blocked" ? 1 : 0),

        totalPipelineDurationMs: FieldValue.increment(payload.durationMs ?? 0),

        persistedInsights: FieldValue.increment(payload.persisted ? 1 : 0),
        fallbackInsights: FieldValue.increment(payload.usedFallback ? 1 : 0),

        rawSignalsSeen: FieldValue.increment(payload.rawSignalCount ?? 0),
        scoredSignalsSeen: FieldValue.increment(payload.scoredSignalCount ?? 0),

        attentionAllowedRuns: FieldValue.increment(payload.attentionAllowed === true ? 1 : 0),
        attentionBlockedRuns: FieldValue.increment(payload.attentionAllowed === false ? 1 : 0),

        triggerEligibleRuns: FieldValue.increment(payload.triggerEligible === true ? 1 : 0),
        triggerBlockedRuns: FieldValue.increment(payload.triggerEligible === false ? 1 : 0),

        reservationAllowedRuns: FieldValue.increment(payload.reservationAllowed === true ? 1 : 0),
        reservationBlockedRuns: FieldValue.increment(payload.reservationAllowed === false ? 1 : 0),

        updatedAt: FieldValue.serverTimestamp(),
        updatedAtMs: now,
    };
};

const buildAgentDailyMetricPatch = ({ payload, dateKey, shardId, now }) => {
    return {
        dateKey,
        shardId,

        totalAgentRuns: FieldValue.increment(1),
        successfulAgentRuns: FieldValue.increment(payload.status === "success" ? 1 : 0),
        fallbackAgentRuns: FieldValue.increment(payload.usedFallback ? 1 : 0),
        failedAgentRuns: FieldValue.increment(payload.status === "failed" ? 1 : 0),

        timeoutAgentRuns: FieldValue.increment(payload.timedOut ? 1 : 0),
        malformedAgentRuns: FieldValue.increment(payload.schemaValid === false ? 1 : 0),

        totalAgentDurationMs: FieldValue.increment(payload.durationMs ?? 0),

        updatedAt: FieldValue.serverTimestamp(),
        updatedAtMs: now,
    };
};

const buildInsightDailyMetricPatch = ({ payload, dateKey, shardId, now }) => {
    return {
        dateKey,
        shardId,

        totalInsightEvents: FieldValue.increment(1),
        generatedInsights: FieldValue.increment(payload.eventType === "INSIGHT_GENERATED" ? 1 : 0),

        fallbackInsightEvents: FieldValue.increment(payload.isFallback ? 1 : 0),

        highSeverityInsights: FieldValue.increment(
            String(payload.severity ?? "").toUpperCase() === "HIGH" ? 1 : 0
        ),
        mediumSeverityInsights: FieldValue.increment(
            String(payload.severity ?? "").toUpperCase() === "MEDIUM" ? 1 : 0
        ),
        lowSeverityInsights: FieldValue.increment(
            String(payload.severity ?? "").toUpperCase() === "LOW" ? 1 : 0
        ),

        updatedAt: FieldValue.serverTimestamp(),
        updatedAtMs: now,
    }
}
