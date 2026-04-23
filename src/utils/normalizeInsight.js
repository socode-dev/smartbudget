const getInsightDate = (createdAt) => {
  if (!createdAt) return new Date();
  if (typeof createdAt?.toDate === "function") return createdAt.toDate();
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export const normalizeInsight = (insight) => {
    const insightDate = getInsightDate(insight.createdAt);
     const month = new Intl.DateTimeFormat("en-US", {month: "short"}).format(insightDate);

    if(insight.agent?.explanation) {
        return {
            id: insight.id,
            type: insight.type,
            actionType: insight.actionType,
            category: insight.category,
            createdAt: insightDate,
            expiresAt: insight.expiresAt,
            month,
            year: insight.year,
            severity: (insight?.severity || "low").toUpperCase(),
            message: insight.agent.explanation,
            actionText: insight.agent.suggestion,
            modelUsed: insight.modelUsed || "Unknown"
        }
    }

    return {
            id: insight.id,
            type: insight.type,
            actionType: insight.actionType,
            category: insight.category,
            createdAt: insightDate,
            expiresAt: insight.expiresAt,
            month,
            year: insight.createdAt.toDate().getFullYear(),
            severity: (insight?.severity || "low").toUpperCase(),
            message: insight.message,
            actionText: insight.actionText,
            modelUsed: "Legacy"
        }
}