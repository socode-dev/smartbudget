import { doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "../../../src/firebase/firebase"

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
                projectedRemainingBalance: cashFlowData.forecast.projected_remaining_balance,
                incomeTotal: cashFlowData.income.total,
                lastTriggered: Date.now(),
            });

            return {triggered: true, reason: "FIRST_TIME"}
        }

        const existing = snap.data();

        const outcomeChanged = existing.outcome !== cashFlowData.outcome;

        const prevOverspend = Math.abs(existing.projectedRemainingBalace);
        const newOverspend = Math.abs(cashFlowData.forecast.projected_remaining_balance);

        const overspendIncreased = newOverspend - prevOverspend > 100;

        const prevRatio = existing.incomeToal > 0 ? existing.projectedTotalSpend / existing.incomeTotal : 0;

        const newRatio = cashFlowData.forecast.income_total > 0 ? cashFlowData.forecast.projected_total_spend / cashFlowData.forecast.income_total : 0;

        const ratioIncreased = newRatio - prevRatio > 0.1

        const shouldRemind = cashFlowData.outcome === "WARNING" && Date.now() - existing.lastTriggered > REMINDER_INTERVAL;

        const shouldTrigger = outcomeChanged || overspendIncreased || ratioIncreased || shouldRemind;

        if(shouldTrigger) {
            transaction.update(ref, {
                outcome: cashFlowData.outcome,
                projectedTotalSpend: cashFlowData.forecast.projected_total_spend,
                projectedRemainingBalance: cashFlowData.forecast.projected_remaining_balance,
                incomeTotal: cashFlowData.forecast.income_total,
                lastTriggered: Date.now()
            })
        }

        return {triggered: shouldTrigger, reason: outcomeChanged ? "OUTCOME_CHANGED" : overspendIncreased ? "OVERSPEND_INCREASED" : ratioIncreased ? "RATIO_INCREASED" : shouldRemind ? "REMINDER" : "NO_CHANGE"}

    })
}