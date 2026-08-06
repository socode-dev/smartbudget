import { db } from "../../lib/firebaseAdmin.js";

export const loadFinancialData = async ({ userId } = {}) => {
    if(!userId) throw new Error("Missing user id");

    const [transactions, budgets] = await Promise.all([
        readUserSubcollection({ userId, collectionName: "transactions" }),
        readUserSubcollection({ userId, collectionName: "budgets" })
    ]);

    return { transactions, budgets };
};

const readUserSubcollection = async ({ userId, collectionName }) => {
    try{
        const snapshot = await db
        .collection("users")
        .doc(userId)
        .collection(collectionName)
        .get();

        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (err) {
        console.error(`USER_SUBCOLLECTION_READ_FAILED: ${collectionName}`, err);

        return  [];
    }
}