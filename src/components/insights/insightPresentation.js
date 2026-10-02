
const typeLabels = {
  anomaly: "Anomaly",
  budget: "Budget",
  "budget-compliance": "Budget",
  cashflow: "Cash flow",
  risk: "Risk",
  "financial-risk": "Risk",
};

export const titleCase = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const insightTypeLabel = (type) => typeLabels[type] || titleCase(type) || "Unknown";

export const getInsightExplanation = (insight) =>
  insight?.message || insight?.agent?.explanation || "";

export const toInsightDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : new Date(
          typeof value?.seconds === "number" ? value.seconds * 1000 : value,
        );

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatInsightDate = (value) => {
  const date = toInsightDate(value);

  return date
    ? [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-")
    : "N/A";
};
