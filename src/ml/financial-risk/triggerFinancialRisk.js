import { getMonth, getYear } from "date-fns";
import {doc, getDoc, setDoc, runTransaction, serverTimestamp} from "firebase/firestore";
import {db} from "../../firebase/firebase";

const buildRiskKey = () => {
    const now = new Date();
    const month = getMonth(now) + 1;
    const year = getYear(now);

    return `risk_${year}_${month}`;
}

export const triggerRiskTransactional = async (userId, newRiskScore, newRiskLevel) => {
    const key = buildRiskKey();
    const ref = doc(db, "users", userId, "financialRiskTriggers", key);

    return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);

        if(!snap.exists()) {
            transaction.set(ref, {
                score: newRiskScore,
                level: newRiskLevel,
                triggeredAt: serverTimestamp()
            }, {merge: true});

            return {triggered: true};
        };

        const existing = snap.data();
        const prevRiskScore = existing.score;
        const prevRiskLevel = existing.level;

        const scoreIncreasedSignificantly = newRiskScore - prevRiskScore >= 10;
        const levelChanged = prevRiskLevel !== newRiskLevel;

        const shouldTrigger = scoreIncreasedSignificantly || levelChanged;

        if(shouldTrigger) {
            transaction.update(ref, {
                score: newRiskScore,
                level: newRiskLevel,
                triggeredAt: serverTimestamp()
            });
        }

        return {triggered: shouldTrigger}
    })


}