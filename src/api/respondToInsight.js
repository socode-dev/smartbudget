export const respondToInsight = async ({
    userId,
    insight,
    response,
    surface
}) => {
    const result = await fetch("/api/insights/respond", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId,
            insightId: insight.id,
            response,
            surface,
        }),
    });

    const body = await result.json().catch(() => null);

    if (!result.ok || body?.ok !== true) {
        throw new Error(body?.error?.message || body?.error || "Request failed. Please try again");
    }

    return body;
}