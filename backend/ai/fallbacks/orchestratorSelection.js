// import { hasSystemicPressure } from "../orchestrator/scoreSignals.js";

// export const fallback = ({ signals }) => {
//     if (!signals?.length) return null;

//     if (hasSystemicPressure({signals})) {
//         const riskSignal = signals.find(s => s.type === "financial-risk");
        
//         if (riskSignal) return riskSignal;
//     }

//     return signals.reduce((best, current) =>
//         (current.urgencyScore || 0) > 
//         (best.urgencyScore || 0) ? 
//         current : best
//         , signals[0]
//     );
// };


export const fallback = ({signals = []}) => {
    if(!signals.length) return null;

    const scoredSignals = signals.map(signal => {
        let score = 0;

        const severity = signal.severity?.toUpperCase();

        if(severity === "HIGH") score += 60;
        if(severity === "MEDIUM") score += 35;

        // financial risk
        if(signal.type === "financial-risk") {
            score += signal?.orchestrationContext?.riskScore || 0;
            if(signal?.orchestrationContext?.spendingTrend) score += 15;
        } 
        
        // Cashflow
        if(signal.type === "cashflow") {
            const runway = signal?.orchestrationContext?.spendingRunway;

            if(runway && runway <= 7) score += 40;

            if(signal?.orchestrationContext?.hasNoIncome) score += 30;
        }

        // Budget
        if(signal.type === "budget") {
            const percent = signal?.orchestrationContext?.percentUsed;

            if(percent >= 100) score += 35;
        }

        // Anomaly
        if(signal.type === "anomaly") {
            const deviation = signal?.orchestrationContext?.deviationPercent;

            if(deviation >= 100) score += 25;
        }

        return {...signal, fallbackScore: score}
    })

    return scoredSignals.sort((a, b) => b.fallbackScore - a.fallbackScore)[0]
};