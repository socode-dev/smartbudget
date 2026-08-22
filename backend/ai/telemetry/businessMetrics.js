import { FieldValue } from "../../../lib/firebaseAdmin.js";

export const buildBusinessDailyMetricPatch = ({ payload, dateKey, shardId, now }) => {
    const eventType = payload.eventType;

    return {
        dateKey,
        shardId,

        totalBusinessEvents: FieldValue.increment(1),

        sftpImportsReceived: FieldValue.increment(eventType === "sftp_import_received" ? 1 : 0),
        sftpImportsProcessed: FieldValue.increment(eventType === "sftp_import_processed" ? 1 : 0),
        sftpCustomersImported: FieldValue.increment(eventType === "sftp_customer_imported" ? 1 : 0),
        sftpFinancialDataImports: FieldValue.increment(eventType === "sftp_financial_data_imported" ? 1 : 0),
        sftpImportsFailed: FieldValue.increment(eventType === "sftp_import_failed" ? 1 : 0),

        customersImported: FieldValue.increment(eventType === "customer_imported" ? 1 : 0),
        customersClaimed: FieldValue.increment(eventType === "customer_claimed" ? 1 : 0),
        activeCustomers: FieldValue.increment(eventType === "customer_active" ? 1 : 0),

        insightsGenerated: FieldValue.increment(eventType === "insight_generated" ? 1 : 0),
        insightsViewed: FieldValue.increment(eventType === "insight_viewed" ? 1 : 0),
        insightsAcknowledged: FieldValue.increment(eventType === "insight_acknowledged" ? 1 : 0),
        insightsDismissed: FieldValue.increment(eventType === "insight_dismissed" ? 1 : 0),
        insightsExpired: FieldValue.increment(eventType === "insight_expired" ? 1 : 0),

        budgetBreaches: FieldValue.increment(eventType === "budget_breach" ? 1 : 0),
        budgetBreachesResolved: FieldValue.increment(eventType === "budget_breach_resolved" ? 1 : 0),
        anomaliesDetected: FieldValue.increment(eventType === "anomaly_detected" ? 1 : 0),

        updatedAt: FieldValue.serverTimestamp(),
        updatedAtMs: now
    };
};