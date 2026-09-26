export const runInsightPipeline = async ({
  userId,
  currency,
  isDemo = false,
} = {}) => {
  let response;
  try {
    response = await fetch("/api/insights/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, currency, isDemo }),
    });
  } catch {
    throw Object.assign(
      new Error("New insights are temporarily unavailable."),
      { code: "INSIGHT_SERVICE_UNAVAILABLE" },
    );
  }

  const data = await response.json().catch(() => null);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw Object.assign(
      new Error("New insights are temporarily unavailable."),
      { code: "INSIGHT_SERVICE_UNAVAILABLE" },
    );
  }

  if (!response.ok) {
    const error = new Error("New insights are temporarily unavailable.");
    error.code = data?.error || "INSIGHT_PIPELINE_FAILED";
    throw error;
  }

  return data;
};
