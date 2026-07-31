import { buildTrigger, getTriggerRef } from "../triggers/lib.js";
import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { evaluateTrigger } from "../triggers/evaluateTrigger.js";

export const reserveSelectedSignal = async ({userId, selectedSignal, candidateSignals}) => {
    const orderedSignals = [
        selectedSignal,
        ...candidateSignals.filter(signal => signal.id !== selectedSignal.id)
    ];

    for (const signal of orderedSignals) {
        const reservation = await reserveSignalTrigger({userId, signal});

        if(reservation.allowed) {
            return signal;
        }
    }

    return null;
}


export const reserveSignalTrigger = async ({ userId, signal } = {}) => {
    const trigger = buildTrigger(signal);

    if (!userId || !trigger) {
        return { allowed: false, reason: "INVALID_TRIGGER" };
    }

    const ref = getTriggerRef({ userId, triggerKey: trigger.key });
    const now = Date.now();

    return await db.runTransaction(async transaction => {
        const snap = await transaction.get(ref);
        const existing = snap.exists ? snap.data() : null;
        const eligibility = evaluateTrigger({ existing, trigger, now });

        if (!eligibility.allowed) {
            return eligibility;
        }

        const payload = {
            triggerKey: trigger.key,
            type: trigger.type,
            status: "reserved",
            reason: eligibility.reason,
            signalId: signal.id ?? null,
            severity: signal.severity ?? null,
            fingerprint: trigger.fingerprint,
            snapshot: trigger.snapshot,
            reservedAt: FieldValue.serverTimestamp(),
            reservedAtMs: now,
            updatedAt: FieldValue.serverTimestamp(),
            updatedAtMs: now,
        };

        transaction.set(ref, payload, { merge: true });

        return { allowed: true, reason: eligibility.reason, triggerKey: trigger.key };
    });
};