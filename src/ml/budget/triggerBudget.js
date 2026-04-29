import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export const triggerBudgetComplianceTransactional = async (userId, complianceData) => {
    const key = `${complianceData.category}_${complianceData.budget.month}_${complianceData.budget.year}`;
    const ref = doc(db, "users", userId, "budgetSignals", key);

    return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);

        const currentPercent = complianceData.derived.percent_budget_used;
        const currentStatus = complianceData.derived.compliance_status;

        if(!snap.exists()) {
            transaction.set(ref, {
                percentBudgetUsed: currentPercent,
                status: currentStatus,
                lastTriggered: serverTimestamp(),
            });

            return {triggered: true}
        }

        const prevData = snap.data();

        const percentChanged = Math.abs(currentPercent - prevData.percentBudgetUsed) >= 10;

        const statusChanged = prevData.status !== currentStatus;

        const shouldTrigger = percentChanged || statusChanged;

        if(shouldTrigger) {
            transaction.update(ref, {
                percentBudgetUsed: currentPercent,
                status: currentStatus,
                lastTriggered: serverTimestamp(),
            });
        }

        return {triggered: shouldTrigger}
    })
} 