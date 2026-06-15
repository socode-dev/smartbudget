export const validateDecision = ({decision, signals = []}) => {
    if(!decision) return false;

    if(!decision.selectedSignalType) return false;

    if(!decision.reason) return false;

    const allowedSignalsType = signals.map(signal => signal.type);

    if(!allowedSignalsType.includes(decision.selectedSignalType)) return false;

    const signalExists = signals.some(signal => signal.id === decision.selectedSignalId);

    return signalExists;
}