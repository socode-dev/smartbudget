import {db, FieldValue, QUOTA_LIMIT} from "./firebaseAdmin.js";

export const consumeQuota = async (userId) => {
    const ref = db.collection("users").doc(userId).collection("usage").doc("ai");
    
    return await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(ref);
        
        let count = 0;
        let limit = Number(QUOTA_LIMIT);
        if(!Number.isFinite(limit) || limit <= 0) {
            throw new Error("invalid QUOTA_LIMIT configuration");
        }
        
        // Initialize if document doesn't exist
        if(!snap.exists) {
            const initialData = {
                count: 1,
                updatedAt: FieldValue.serverTimestamp()
            };
            transaction.set(ref, initialData);
            return {allowed: true, count: 1};
        }
        
        // Read existing data
        const data = snap.data();
        count = data.count || 0;
        
        // Check if quota exceeded
        if(count >= limit) {
            return {allowed: false, count};
        }
        
        transaction.update(ref, {
            count: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp()
        });
        
        return {allowed: true, count};
    });
}