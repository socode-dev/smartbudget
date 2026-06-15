import {db, FieldValue} from "../../../lib/firebaseAdmin.js";

const EXPIRY_MS = 2 * 24 * 60 * 60 * 1000;

export const persistInsights = async ({userId, insight}) => {
    if(!insight) return false;

    try {
        await addInsight({userId, insight});
        return true;
    } catch (err) {
        console.error("PERSISTENCE_FAILED:", err)
        return false;
    }
}

const addInsight = async ({userId, insight}) => {
    const insightWithExpiry = {
        ...insight,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Date.now() + EXPIRY_MS,
    } 

    await db
    .collection("users")
    .doc(userId)
    .collection("insights")
    .add(insightWithExpiry)
}

