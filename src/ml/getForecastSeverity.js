export const getForecastSeverity = (predicted, budget) => {
  if (!budget || budget <= 0) return "low";

  const ratio = predicted / budget;

  if (ratio < 0.8) return "low";
  if (ratio < 1.0) return "medium";
  return "high";
};
