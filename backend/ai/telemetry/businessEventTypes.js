export const BUSINESS_EVENT_TYPES = Object.freeze([
    "sftp_import_received",
    "sftp_import_processed",
    "sftp_customer_imported",
    "sftp_financial_data_imported",
    "sftp_import_failed",
    "customer_imported",
    "customer_claimed",
    "customer_active",
    "insight_generated",
    "insight_viewed",
    "insight_acknowledged",
    "insight_dismissed",
    "insight_expired",
    "budget_breach",
    "budget_breach_resolved",
    "anomaly_detected",
]);

export const isBusinessEventType = eventType =>
    BUSINESS_EVENT_TYPES.includes(eventType);
