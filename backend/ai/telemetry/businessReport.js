import { db } from "../../../lib/firebaseAdmin.js";

const BUSINESS_METRICS = [
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
]

const countUniqueCustomersForMetric = async ({
    markerCollection,
    eventType,
    startDate,
    endDate,
}) => {
    const snapshot = await markerCollection
    .where("eventType", "==", eventType)
    .where("dateKey", ">=", startDate)
    .where("dateKey", "<=", endDate)
    .get();

    const customerHashes = new Set();

    for (const document of snapshot.docs) {
        const data = document.data();

        if (data.customerKeyHash) {
            customerHashes.add(data.customerKeyHash);
        }
    }

    return customerHashes.size;
}
const getUniqueMetrics = async ({
    markerCollection,
    startDate,
    endDate
}) => {
    const result = {};

    for (const eventType of BUSINESS_METRICS) {
        result[eventType] = await countUniqueCustomersForMetric({
            markerCollection,
            eventType,
            startDate,
            endDate
        });
    }

    return result;
}

const calculateChangePercent = ({ baseline, pilot }) => {
    if (baseline === 0) return pilot === 0 ? 0 : null;

    return Number((((pilot - baseline) / baseline) * 100).toFixed(2));
};

export const buildPilotBusinessReport = async ({
    institutionId,
    pilotId,
    baselineStart,
    baselineEnd,
    pilotStart,
    pilotEnd
}) => {
    if (!institutionId || !pilotId) throw new Error ("MISSING_PILOT_SCOPE");

    const markerCollection = db
    .collection("institutions")
    .doc(institutionId)
    .collection("pilots")
    .doc(pilotId)
    .collection("uniqueCustomers");

    const baseline = await getUniqueMetrics({
        markerCollection,
        startDate: baselineStart,
        endDate: baselineEnd
    });

    const pilot = await getUniqueMetrics({
        markerCollection,
        startDate: pilotStart,
        endDate: pilotEnd
    });

    const observedChange = {};

    for (const metric of BUSINESS_METRICS) {
        observedChange[metric] = {
            absoluteChange: pilot[metric] - baseline[metric],
            percentageChange: calculateChangePercent({
                baseline: baseline[metric],
                pilot: pilot[metric]
            }),
        };
    }

    return {
        scope: {
            institutionId,
            pilotId,
        },
        periods: {
            baseline: {
                startDate: baselineStart,
                endDate: baselineEnd
            },
            pilot: {
                startDate: pilotStart,
                endDate: pilotEnd
            },
        },
        metricType: "unique_customers",
        baseline,
        pilot,
        observedChange,
    };
};