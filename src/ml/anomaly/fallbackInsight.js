export const fallback = (anomaly) => {
    const id = anomaly?.id ?? `anomaly-${Date.now()}`;
    const severity = anomaly?.risk?.level ?? "LOW";
    const baselineValue = anomaly?.signal?.baseline_value ?? 0;
    const category = anomaly?.category ?? "General";
    const month = anomaly?.signal?.month ?? "Unknown";
    const deviationLabel = anomaly?.signal?.deviation_label ?? "different";
    const impactHint = anomaly?.impact?.impact_hint ?? "requires attention";
    
    return {
        id,
      type: "anomaly",
      actionType: "suggestion",
      createdAt: new Date(),
      severity,
      baselineValue,
      category,
      month,
      year: new Date().getFullYear(),
      agent: {
          explanation: `Your ${category} spending in  ${month} is ${deviationLabel} compared to your normal pattern and ${impactHint}`,
        suggestion: `Try reducing your ${category} spending or setting a limit.`
      }
    }
}