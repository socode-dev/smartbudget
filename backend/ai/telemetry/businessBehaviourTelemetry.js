import { db } from "../../../lib/firebaseAdmin.js";
import { logBusinessEvent } from "./businessLogger.js";

const getStateRef = ({ userId, stateKey }) => {
    return db
    .collection("users")
    .doc(userId)
    .collection("businessTelemetryState")
    .doc(stateKey);
}

const markTransitionIfChanged = async ({
    userId,
    stateKey,
    currentlyActive
}) => {
    const stateRef = getStateRef({ userId, stateKey });

    return db.runTransaction(async transaction => {
        const snapshot = await transaction.get(stateRef);

        const previousActive = snapshot.exists
        ? Boolean(snapshot.data()?.active) 
        : false;

        if (previousActive === currentlyActive) {
            return {
                changed: false,
                previousActive
            };
        }

        transaction.set(
            stateRef,
            {
                active: currentlyActive,
                updatedAtMs: Date.now(),
            },
            { merge: true }
        );

        return {
            changed: true,
            previousActive,
        };
    });
};

export const recordFinancialBehaviourTelemetry = async ({
    userId,
    institutionId = null,
    pilotId = null,
    cohortId = null,
    dataSource = null,
    enrollmentSource = null,
    budgetComplianceList = [],
    anomalies = [],
}) => {
    if (!userId) return;

    for (const budget of budgetComplianceList) {
        const category = budget.category || "unknown";
        const month = budget.budget?.month || "unknown";
        const year = budget.budget?.year || "unknown";

        const breached = budget.derived?.compliance_status === "EXCEEDED";

        const stateKey = `budget_${category}_${year}_${month}`;

        
        const transition = await markTransitionIfChanged({ 
            userId,
            stateKey,
            currentlyActive: breached,
        });

        if (!transition.changed) continue;

        await logBusinessEvent({
            userId,
            institutionId,
            pilotId,
            cohortId,
            dataSource,
            enrollmentSource,
            eventType: breached ? "budget_breach" : "budget_breach_resolved",
            metadata: {
                category,
                month,
                year,
                budgetAmount: budget.budget?.amount ?? null,
                totalSpent: budget.spending?.total_spent ?? null,
                complianceStatus: budget.derived?.compliance_status ?? null
            }
        });
    }

    for (const anomaly of anomalies) {
        const category = anomaly.category || "unknown";
        const month = anomaly.signal?.month || "unknown";

        const stateKey = `anomaly_${category}_${month}`;

        const transition = await markTransitionIfChanged({
            userId,
            stateKey,
            currentlyActive: true,
        });

        if (!transition.changed) continue;

        await logBusinessEvent({
            userId,
            institutionId,
            pilotId,
            cohortId,
            dataSource,
            enrollmentSource,
            eventType: "anomaly_detected",
            metadata: {
                category,
                month,
                deviationPercent: anomaly.signal?.deviation_percent ?? null,
                baselineValue: anomaly.signal?.baseline_value ?? null,
                currentValue: anomaly.signal?.current_value ?? null,
            }
        });
    }
};