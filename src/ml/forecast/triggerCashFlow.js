import { doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/firebase"

const REMINDER_INTERVAL = 24 * 60 * 60  * 1000;

export const triggerCashFlowTransactional = async (userId, cashFlowData) => {
    const key = `txn_${cashFlowData.period.month}`
    const ref = doc(db, "users", userId, "cashFlowSignal", key);

    return await runTransaction(db, async transaction => {
        const snap = await transaction.get(ref);

        if(!snap.exists()) {
            transaction.set(ref, {
                outcome: cashFlowData.outcome,
                projectedTotalSpend: cashFlowData.forecast.projected_total_spend,
                projectedRemainingBalace: cashFlowData.forecast.projected_remaining_balance,
                incomeTotal: cashFlowData.income.total,
                lastTriggered: Date.now(),
            });

            return {triggered: true, reason: "FIRST_TIME"}
        }

        const existing = snap.data();

        const outcomeChanged = existing.outcome !== cashFlowData.outcome;

        const prevOverspend = Math.abs(existing.projectedRemainingBalace);
        const newOverspend = Math.abs(cashFlowData.forecast.projectedRemainingBalace);

        const overspendIncreased = newOverspend - prevOverspend > 100;

        const prevRatio = existing.projectedTotalSpend / existing.incomeTotal;

        const newRatio = cashFlowData.forecast.projected_total_spend / cashFlowData.forecast.income_total;

        const ratioIncreased = newRatio - prevRatio > 0.1

        const shouldRemind = cashFlowData.outcome === "WARNING" && Date.now() - existing.lastTriggered > REMINDER_INTERVAL;

        const shouldTrigger = outcomeChanged || overspendIncreased || ratioIncreased || ratioIncreased || shouldRemind;

        if(shouldTrigger) {
            transaction.update(ref, {
                outcome: cashFlowData.outcome,
                projectedTotalSpend: cashFlowData.forecast.projected_total_spend,
                projectedRemainingBalace: cashFlowData.forecast.projected_remaining_balance,
                incomeTotal: cashFlowData.income.total,
                lastTriggered: serverTimestamp()
            })
        }

        return {triggered: shouldTrigger, reason: outcomeChanged ? "OUTCOME_CHANGED" : overspendIncreased ? "OVERSPEND_INCREASED" : ratioIncreased ? "RATIO_INCREASED" : shouldRemind ? "REMINDER" : "NO_CHANGE"}

    })
}