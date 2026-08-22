import {db, FieldValue} from "../../../lib/firebaseAdmin.js";

const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const persistInsights = async ({userId, insight}) => {
    if(!insight) return false;

    try {
        return await addInsight({ userId, insight });
    } catch (err) {
        console.error("PERSISTENCE_FAILED:", err)
        return false;
    }
}

const addInsight = async ({userId, insight}) => {
    const insightWithExpiry = {
        ...insight,
        status: "ACTIVE",
        valid: true,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Date.now() + EXPIRY_MS,
    } 

    const docRef = await db
    .collection("users")
    .doc(userId)
    .collection("insights")
    .add(insightWithExpiry)

    await docRef.update({ id: docRef.id });

    return { persisted: true, insightId: docRef.id };
}

