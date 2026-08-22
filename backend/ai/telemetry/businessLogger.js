import { randomUUID } from "crypto";
import { writeTelemetryEvent } from "./writeTelemetryEvent.js";

export const logBusinessEvent = async ({
    userId,
    eventType,
    institutionId = null,
    pilotId = null,
    cohortId = null,
    source = "backend",
    dataSource = null,
    enrollmentSource = null,
    importId = null,
    insightId = null,
    insightType = null,
    severity = null,
    surface = null,
    metadata = {}
} = {}) => {
    if(!userId || !eventType) return false;

    const eventId = `${eventType}_${randomUUID()}`;

    return writeTelemetryEvent({
        userId,
        category: "businessEvents",
        eventId,
        payload: {
            schemaVersion: 1,
            eventId,
            eventType,
            userId,
            institutionId,
            pilotId,
            cohortId,
            source,
            dataSource,
            enrollmentSource,
            importId,
            insightId,
            insightType,
            severity,
            surface,
            metadata,
            occurredAtMs: Date.now(),
            environment: process.env.NODE_ENV || "development"
        }
    });
}