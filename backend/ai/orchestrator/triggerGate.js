import { FieldValue } from "../../../lib/firebaseAdmin.js";
import {evaluateTrigger} from "../triggers/evaluateTrigger.js";
import {buildTrigger, getTriggerRef} from "../triggers/lib.js";

export const filterEligibleSignals = async ({ userId, signals = [] } = {}) => {
    if (!userId || !Array.isArray(signals) || !signals.length) return [];

    const checks = await Promise.all(
        signals.map(async signal => {
            const eligibility = await checkSignalEligibility({ userId, signal });
            return eligibility.allowed ? signal : null;
        })
    );

    return checks.filter(Boolean);
};


export const checkSignalEligibility = async ({ userId, signal } = {}) => {
    const trigger = buildTrigger(signal);

    if (!userId || !trigger) {
        return { allowed: false, reason: "INVALID_TRIGGER" };
    }

    const ref = getTriggerRef({ userId, triggerKey: trigger.key });
    const snap = await ref.get();

    return evaluateTrigger({ existing: snap.exists ? snap.data() : null, trigger, now: Date.now() });
};


export const markSignalTriggered = async ({ userId, signal, insight } = {}) => {
    const trigger = buildTrigger(signal);

    if (!userId || !trigger) return;

    const now = Date.now();
    const ref = getTriggerRef({ userId, triggerKey: trigger.key });

    await ref.set({
        triggerKey: trigger.key,
        type: trigger.type,
        status: "fired",
        signalId: signal.id ?? null,
        insightId: insight?.id ?? null,
        severity: signal.severity ?? null,
        fingerprint: trigger.fingerprint,
        snapshot: trigger.snapshot,
        lastTriggeredAt: FieldValue.serverTimestamp(),
        lastTriggeredAtMs: now,
        updatedAt: FieldValue.serverTimestamp(),
        updatedAtMs: now,
    }, { merge: true });
};

export const markSignalTriggerFailed = async ({ userId, signal, error } = {}) => {
    const trigger = buildTrigger(signal);

    if (!userId || !trigger) return;

    const now = Date.now();
    const ref = getTriggerRef({ userId, triggerKey: trigger.key });

    await ref.set({
        triggerKey: trigger.key,
        type: trigger.type,
        status: "failed",
        signalId: signal.id ?? null,
        errorMessage: error?.message ?? "Unknown trigger failure",
        failedAt: FieldValue.serverTimestamp(),
        failedAtMs: now,
        updatedAt: FieldValue.serverTimestamp(),
        updatedAtMs: now,
    }, { merge: true });
};