import { db } from "../../../lib/firebaseAdmin.js";
import { getDailyMetricId } from "./utils.js";
import {
    CATEGORY_METRICS,
    UNIQUE_CUSTOMER_EVENT_TYPES,
    TELEMETRY_METRIC_DEFINITIONS,
} from "./readModelDefinitions.js";

const assertDateKey = dateKey => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        throw new Error("INVALID_TELEMETRY_DATE");
    }

    const parsed = new Date(`${dateKey}T00:00:00.000Z`);

    if (parsed.toISOString().slice(0, 10) !== dateKey) {
        throw new Error("INVALID_TELEMETRY_DATE");
    }
};

export const getDateKeysInRange = ({ startDate, endDate }) => {
    assertDateKey(startDate);
    assertDateKey(endDate);

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);

    if (start > end) throw new Error("INVALID_TELEMETRY_DATE_RANGE");

    const dates = [];

    for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
        dates.push(cursor.toISOString().slice(0, 10));
    }

    return dates;
};

const createEmptyMetrics = category =>
    Object.fromEntries(CATEGORY_METRICS[category].map(metric => [metric, 0]));

export const sumMetricShards = ({ category, snapshots }) => {
    const totals = createEmptyMetrics(category);

    for (const snapshot of snapshots) {
        const data = snapshot.data();

        for (const metric of CATEGORY_METRICS[category]) {
            totals[metric] += Number(data[metric] ?? 0);
        }
    }

    return totals;
};

const getDailyMetricShardsRef = ({ dateKey, category, institutionId, pilotId }) => {
    if (institutionId || pilotId) {
        if (!institutionId || !pilotId) throw new Error("INCOMPLETE_TELEMETRY_SCOPE");

        return db
            .collection("institutions")
            .doc(institutionId)
            .collection("pilots")
            .doc(pilotId)
            .collection("dailyMetrics")
            .doc(getDailyMetricId({ dateKey, category }))
            .collection("shards");
    }

    return db
        .collection("globalMetrics")
        .doc("daily")
        .collection("records")
        .doc(getDailyMetricId({ dateKey, category }))
        .collection("shards");
};

const readDailyMetrics = async ({ dateKey, institutionId, pilotId }) => {
    const categories = Object.keys(CATEGORY_METRICS);
    const entries = await Promise.all(categories.map(async category => {
        const snapshot = await getDailyMetricShardsRef({
            dateKey,
            category,
            institutionId,
            pilotId,
        }).get();

        return [category, sumMetricShards({ category, snapshots: snapshot.docs })];
    }));

    return Object.fromEntries(entries);
};

const sumDailyMetrics = daily => {
    const totals = Object.fromEntries(
        Object.keys(CATEGORY_METRICS).map(category => [category, createEmptyMetrics(category)])
    );

    for (const day of daily) {
        for (const [category, metrics] of Object.entries(day.metrics)) {
            for (const [metric, value] of Object.entries(metrics)) {
                totals[category][metric] += value;
            }
        }
    }

    return totals;
};

const getUniqueCustomerMarkerCollection = ({ institutionId, pilotId }) => {
    if (institutionId || pilotId) {
        if (!institutionId || !pilotId) throw new Error("INCOMPLETE_TELEMETRY_SCOPE");

        return db
            .collection("institutions")
            .doc(institutionId)
            .collection("pilots")
            .doc(pilotId)
            .collection("uniqueCustomers");
    }

    return db
        .collection("globalMetrics")
        .doc("uniqueCustomers")
        .collection("records");
};

const readUniqueCustomerMetrics = async ({ markerCollection, startDate, endDate }) => {
    const entries = await Promise.all(UNIQUE_CUSTOMER_EVENT_TYPES.map(async eventType => {
        const snapshot = await markerCollection
            .where("eventType", "==", eventType)
            .where("dateKey", ">=", startDate)
            .where("dateKey", "<=", endDate)
            .get();

        const customerHashes = new Set(
            snapshot.docs
                .map(document => document.data().customerKeyHash)
                .filter(Boolean)
        );

        return [eventType, customerHashes.size];
    }));

    return Object.fromEntries(entries);
};

export const readTelemetryModel = async ({
    startDate,
    endDate,
    institutionId = null,
    pilotId = null,
    includeUniqueCustomers = true,
} = {}) => {
    const dateKeys = getDateKeysInRange({ startDate, endDate });
    const daily = await Promise.all(dateKeys.map(async dateKey => ({
        dateKey,
        metrics: await readDailyMetrics({ dateKey, institutionId, pilotId }),
    })));

    let uniqueCustomers = null;

    if (includeUniqueCustomers) {
        try {
            uniqueCustomers = {
                available: true,
                values: await readUniqueCustomerMetrics({
                    markerCollection: getUniqueCustomerMarkerCollection({ institutionId, pilotId }),
                    startDate,
                    endDate,
                }),
            };
        } catch (error) {
            console.error("UNIQUE_CUSTOMER_METRICS_READ_FAILED:", error);
            uniqueCustomers = {
                available: false,
                values: {},
            };
        }
    }

    return {
        scope: institutionId || pilotId
            ? { type: "pilot", institutionId, pilotId }
            : { type: "global" },
        period: { startDate, endDate },
        metricDefinitions: TELEMETRY_METRIC_DEFINITIONS,
        daily,
        totals: sumDailyMetrics(daily),
        uniqueCustomers: uniqueCustomers
            ? {
                metricType: "unique_customers",
                available: uniqueCustomers.available,
                values: uniqueCustomers.values,
            }
            : null,
    };
};

export const listTelemetryEvents = async ({
    subjectType = "user",
    subjectId,
    category,
    startAtMs = null,
    endAtMs = null,
    limit = 100,
} = {}) => {
    if (!subjectId || !CATEGORY_METRICS[category]) {
        throw new Error("INVALID_TELEMETRY_DETAIL_SCOPE");
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
    let query;

    if (subjectType === "institution") {
        query = db
            .collection("institutions")
            .doc(subjectId)
            .collection(category);
    } else if (subjectType === "user") {
        query = db
            .collection("users")
            .doc(subjectId)
            .collection("telemetry")
            .doc(category)
            .collection("events");
    } else {
        throw new Error("INVALID_TELEMETRY_DETAIL_SCOPE");
    }

    if (startAtMs !== null) query = query.where("createdAtMs", ">=", Number(startAtMs));
    if (endAtMs !== null) query = query.where("createdAtMs", "<=", Number(endAtMs));

    const snapshot = await query.orderBy("createdAtMs", "desc").limit(safeLimit).get();

    return snapshot.docs.map(document => ({
        id: document.id,
        ...document.data(),
    }));
};
