export const normalizeInsight = (insight) => {
    if(insight.agent?.explanation) {
        return {
            id: insight.id,
            type: insight.type,
            actionType: insight.actionType,
            category: insight.category,
            createdAt: insight.createdAt,
            expiresAt: insight.expiresAt,
            month: insight.month,
            year: insight.year,
            severity: insight.severity.toUpperCase(),
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
            createdAt: insight.createdAt,
            expiresAt: insight.expiresAt,
            month: insight.createdAt.toDate().toLocaleString("en-US", {month: "short"}),
            year: insight.createdAt.toDate().getFullYear(),
            severity: insight.severity.toUpperCase(),
            message: insight.message,
            actionText: insight.actionText,
            modelUsed: "Legacy"
        }
}