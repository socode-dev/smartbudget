import { createHash } from "crypto";

const UNIQUE_CUSTOMER_EVENTS = new Set([
    "customer_imported",
    "customer_claimed",
    "customer_active",
    "insight_generated",
    "insight_viewed",
    "insight_acknowledged",
    "insight_dismissed",
    "insight_expired",
    "budget_breach",
    "budget_breach_resolved",
    "anomaly_detected"
]);

export const isUniqueCustomerEvent = (eventType) => UNIQUE_CUSTOMER_EVENTS.has(eventType);

export const getCustomerKey = (payload) => payload.customerId || payload.userId || null;

export const hashCustomerKey = (customerKey) => createHash("sha256").update(String(customerKey)).digest("hex");

const getMarkerId = ({
    dateKey,
    eventType,
    customerKeyHash,
}) => `${dateKey}__${eventType}__${customerKeyHash}`;

export const queueUniqueCustomerMarker = ({
    batch,
    db,
    payload,
    dateKey
}) => {
    if (!isUniqueCustomerEvent(payload.eventType)) return false;

    const customerKeyHash = hashCustomerKey(getCustomerKey(payload));
    const markerId = getMarkerId({
        dateKey,
        eventType: payload.eventType,
        customerKeyHash,
    });

    const marker = {
        dateKey,
        eventType: payload.eventType,
        customerKeyHash,
        createdAtMs: Date.now(),
    };

    const globalMarkerRef = db
    .collection("globalMetrics")
    .doc("uniqueCustomers")
    .collection("records")
    .doc(markerId);

    batch.set(globalMarkerRef, marker, { merge: true });

    if (payload.institutionId && payload.pilotId) {
        const pilotMarkerRef = db
        .collection("institutions")
        .doc(payload.institutionId)
        .collection("pilots")
        .doc(payload.pilotId)
        .collection("uniqueCustomers")
        .doc(markerId);

        batch.set(pilotMarkerRef, marker, { merge: true });
    }

    return true;
}