import { readTelemetryModel, } from "./readModel.js";

const SECTION_METRICS = Object.freeze({
    overview: [
        "totalPipelineRuns",
        "successfulPipelineRuns",
        "fallbackPipelineRuns",
        "failedPipelineRuns",
        "blockedPipelineRuns",
        "persistedInsights",
        "fallbackInsights",
        "sftpImportsReceived",
        "sftpImportsFailed",
        "activeCustomers",
        "highSeverityInsights",
    ],
    intelligence: [
        "totalPipelineRuns",
        "successfulPipelineRuns",
        "fallbackPipelineRuns",
        "failedPipelineRuns",
        "blockedPipelineRuns",
        "totalPipelineDurationMs",
        "persistedInsights",
        "fallbackInsights",
        "rawSignalsSeen",
        "scoredSignalsSeen",
        "attentionAllowedRuns",
        "attentionBlockedRuns",
        "triggerEligibleRuns",
        "triggerBlockedRuns",
        "reservationAllowedRuns",
        "reservationBlockedRuns",
        "totalAgentRuns",
        "successfulAgentRuns",
        "fallbackAgentRuns",
        "failedAgentRuns",
        "timeoutAgentRuns",
        "malformedAgentRuns",
        "totalAgentDurationMs",
        "totalInsightEvents",
        "generatedInsights",
        "fallbackInsightEvents",
        "highSeverityInsights",
        "mediumSeverityInsights",
        "lowSeverityInsights",
    ],
    dataOperations: [
        "sftpImportsReceived",
        "sftpImportsProcessed",
        "sftpCustomersImported",
        "sftpFinancialDataImports",
        "sftpImportsFailed",
        "customersImported",
        "customersClaimed",
    ],
    customerActivity: [
        "customersImported",
        "customersClaimed",
        "activeCustomers",
        "insightsGenerated",
        "insightsViewed",
        "insightsAcknowledged",
        "insightsDismissed",
        "insightsExpired",
        "budgetBreaches",
        "budgetBreachesResolved",
        "anomaliesDetected",
    ],
});

const selectMetrics = ({ metrics, names }) =>
    Object.fromEntries(names.map(name => [name, metrics[name] ?? 0]));

const selectDailyMetrics = ({ daily, names }) => daily.map(day => ({
    dateKey: day.dateKey,
    metrics: selectMetrics({
        metrics: Object.assign({}, ...Object.values(day.metrics)),
        names,
    }),
}));

export const readAdminTelemetry = async ({
    section,
    startDate,
    endDate,
    institutionId = null,
    pilotId = null,
} = {}) => {
    const names = SECTION_METRICS[section];

    if (!names) throw new Error("INVALID_TELEMETRY_SECTION");

    const model = await readTelemetryModel({
        startDate,
        endDate,
        institutionId,
        pilotId,
        includeUniqueCustomers: section === "customerActivity",
    });

    return {
        section,
        scope: model.scope,
        period: model.period,
        metrics: selectMetrics({
            metrics: Object.assign({}, ...Object.values(model.totals)),
            names,
        }),
        daily: selectDailyMetrics({
            daily: model.daily,
            names,
        }),
        metricDefinitions: Object.fromEntries(
            names.map(name => [name, model.metricDefinitions[name]])
        ),
        ...(section === "customerActivity"
            ? { uniqueCustomers: model.uniqueCustomers }
            : {}),
    };
};
