import { db } from "../../../lib/firebaseAdmin.js";
import { TRIGGER_BUILDERS } from "./builders.js";
import { TRIGGER_COLLECTION } from "./utils.js";

export const getTriggerRef = ({ userId, triggerKey }) => {
    return db
        .collection("users")
        .doc(userId)
        .collection(TRIGGER_COLLECTION)
        .doc(triggerKey);
};

export const buildTrigger = signal => {
    if (!signal?.type || !signal?.data) return null;

    const builder = TRIGGER_BUILDERS[signal.type];
    if (!builder) return null;

    return builder(signal);
};