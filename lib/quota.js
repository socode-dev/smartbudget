import {db, FieldValue} from "./firebaseAdmin.js";
const LIMIT = 10;

// export const checkQuota = async (userId) => {
//     const ref = db.collection("users").doc(userId).collection("usage").doc("ai");
//     const snap = await ref.get();
    
//     if(!snap.exists) {
//         return {allowed: true, count: 0, limit: LIMIT}
//     }

//     const data = snap.data();

//     if(data.count >= data.limit) {
//         return {allowed: false, count: data.count, limit: data.limit}
//     }

//     return {allowed: true, count: data.count, limit: data.limit};
// }

// export const incrementQuota = async (userId) => {
//     const ref = db.collection("users").doc(userId).collection("usage").doc("ai");
//     const snap = await ref.get();

//     if(!snap.exists) {
//         await ref.set({
//             count: 1,
//             limit: LIMIT,
//             updatedAt: Date.now()
//         });
//         return;
//     }

//     const data = snap.data();

//     await ref.update({
//         count: data.count + 1,
//         updatedAt: Date.now()
//     });
// }

export const consumeQuota = async (userId) => {
    const ref = db.collection("users").doc(userId).collection("usage").doc("ai");
    
    return await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(ref);
        
        let count = 0;
        let limit = LIMIT;
        
        // Initialize if document doesn't exist
        if(!snap.exists) {
            const initialData = {
                count: 1,
                limit: LIMIT,
                updatedAt: FieldValue.serverTimestamp()
            };
            transaction.set(ref, initialData);
            return {allowed: true, count: 1, limit: LIMIT};
        }
        
        // Read existing data
        const data = snap.data();
        count = data.count || 0;
        limit = data.limit || LIMIT;
        
        // Check if quota exceeded
        if(count >= limit) {
            return {allowed: false, count, limit};
        }
        
        transaction.update(ref, {
            count: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp()
        });
        
        return {allowed: true, count, limit};
    });
}