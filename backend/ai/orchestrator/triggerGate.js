import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import {TRIGGER_BUILDERS} from "../triggers/builders.js";
import {TRIGGER_COLLECTION} from "../triggers/utils.js";
import {evaluateTrigger} from "../triggers/evaluateTrigger.js";

const getTriggerRef = ({ userId, triggerKey }) => {
    return db
        .collection("users")
        .doc(userId)
        .collection(TRIGGER_COLLECTION)
        .doc(triggerKey);
};

const buildTrigger = signal => {
    if (!signal?.type || !signal?.data) return null;

    const builder = TRIGGER_BUILDERS[signal.type];
    if (!builder) return null;

    return builder(signal);
};

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