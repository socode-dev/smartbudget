export const hasSystemicPressure = ({signals}) => {
    if(!signals) console.warn("Signal not available at systemicPressure");

    const highAnomalies = signals.filter(
        s => s.type === "anomaly" && s.severity === "HIGH"
    ).length;

    const exceededBudgets = signals.filter(
    s => 
        s.type === "budget" &&
        s.orchestrationContext?.compliance === "EXCEEDED"
    ).length;

    return highAnomalies >= 2 && exceededBudgets >= 2;
};

export const scoreSignals = ({signals}) => {
    if(!signals) console.warn("Signal not available at scoreSignals");

    const systemicPressure = hasSystemicPressure({signals});

    return signals.map(signal => {
        let urgencyScore = 0;

        if (signal.type === "anomaly") {
            const deviation = signal.orchestrationContext?.deviationPercent || 0;
            const intensity = signal.orchestrationContext?.intensity;
            urgencyScore += intensity === "extreme" ? 40 : 20;
            urgencyScore += Math.min(deviation / 20, 30);
        }

        if (signal.type === "budget") {
            const percentUsed = signal.orchestrationContext?.percentUsed || 0;
            const compliance = signal.orchestrationContext?.compliance;
            urgencyScore += compliance === "EXCEEDED" ? 35 : 15;
            urgencyScore += Math.min((percentUsed - 100) / 10, 20);
        }

        if (signal.type === "cashflow") {
            const outcome = signal.orchestrationContext?.outcome || signal.severity;
            
            if (outcome === "RISK") urgencyScore += 40;
            else if (outcome === "WARNING") urgencyScore += 20;
        }

        if (signal.type === "financial-risk") {
            const score = signal.orchestrationContext?.riskScore || 0;
            urgencyScore += Math.min(score / 4, 20);

            if (systemicPressure) {
                urgencyScore += 60;
            }
        }

        return { ...signal, urgencyScore };
    }).sort((a, b) => b.urgencyScore - a.urgencyScore);
};