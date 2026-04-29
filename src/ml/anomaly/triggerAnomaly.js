import {doc, getDoc, setDoc, runTransaction} from "firebase/firestore";
import {db} from "../../firebase/firebase"


export const triggerAnomalyTransactional = async (userId, anomaly) => {
    const key = buildAnomalyKey(anomaly.category, anomaly.signal.month);
    const ref = doc(db, "users", userId, "detectedAnomalies", key);
    
    return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        
        if(!snap.exists()) {
            transaction.set(ref, {
                category: anomaly.category,
                month: anomaly.signal.month,
                current_value: anomaly.signal.current_value,
                baseline_value: anomaly.signal.baseline_value,
                risk: anomaly.risk.level,
                lastTriggered: Date.now(),
            }, {merge: true});
            return {triggered: true, prevValue: null, newValue: anomaly.signal.current_value};
        }
        

        const existing = snap.data();
        const prevValue = existing.current_value;
        const newValue = anomaly.signal.current_value;
        const threshold = 0.5;
        const absoluteThreshold = 10; 
        
        const hasIncreased = prevValue > 0 
            ? (newValue - prevValue) / prevValue > threshold
            : newValue > prevValue && (newValue - prevValue) > absoluteThreshold;
        
        const severityChanged = existing.risk !== anomaly.risk.level;
        const shouldTrigger = hasIncreased || severityChanged;
        
        if(shouldTrigger) {
            transaction.update(ref, {
                current_value: newValue,
                baseline_value: anomaly.signal.baseline_value,
                risk: anomaly.risk.level,
                lastTriggered: Date.now(),
            });
        }
        
        return {triggered: shouldTrigger, prevValue, newValue};
    });
}

export const shouldTriggerAnomaly = async (userId, anomaly) => {
    const key = buildAnomalyKey(anomaly.category, anomaly.signal.month);

    const ref = doc(db, "users", userId, "detectedAnomalies", key);
    let snap;
    try {
        snap = await getDoc(ref);
    } catch (error) {
        console.error("Failed to fetch anomaly document:", error);
        throw error;
    }

    if(!snap.exists()) return true;
    
    const existing = snap.data();

    const prevValue = existing.current_value;
    const newValue = anomaly.signal.current_value;

    const threshold = 0.2;
    const absoluteThreshold = 10; // For cases where prevValue <= 0

    // Calculate increase: percentage-based if prevValue > 0, absolute-based otherwise
    const hasIncreased = prevValue > 0 
        ? (newValue - prevValue) / prevValue > threshold
        : newValue > prevValue && (newValue - prevValue) > absoluteThreshold;

    const severityChanged = existing.risk !== anomaly.risk.level;

    return hasIncreased || severityChanged;
}
export const markAnomalyTriggered = async (userId, anomaly) => {
    const key = buildAnomalyKey(anomaly.category, anomaly.signal.month);

    const ref = doc(db, "users", userId, "detectedAnomalies", key);

    try {
        await setDoc(ref, {
        category: anomaly.category,
        month: anomaly.signal.month,
        current_value: anomaly.signal.current_value,
        baseline_value: anomaly.signal.baseline_value,
        risk: anomaly.risk.level,
        lastTriggered: Date.now(),
    })
    } catch (err) {
        throw err;
    }
}

const buildAnomalyKey = (category, month) => {
    return `${category}_${month}`;
}