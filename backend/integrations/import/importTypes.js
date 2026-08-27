export const IMPORT_FILE_TYPES = Object.freeze({
    CUSTOMERS: "customers",
    TRANSACTIONS: "transactions",
});

export const IMPORT_STATUSES = Object.freeze({
    RECEIVED: "RECEIVED",
    PROCESSED: "PROCESSED",
    FAILED_VALIDATION: "FAILED_VALIDATION",
    FAILED_PROCESSING: "FAILED_PROCESSING",
    SKIPPED_DUPLICATE_FILE: "SKIPPED_DUPLICATE_FILE",
});

export const IMPORT_SOURCE = Object.freeze({
    SFTP: "sftp",
    MANUAL: "manual",
});

export const BUSINESS_EVENTS = Object.freeze({
    SFTP_IMPORT_RECEIVED: "sftp_import_received",
    SFTP_IMPORT_PROCESSED: "sftp_import_processed",
    SFTP_CUSTOMER_IMPORTED: "sftp_customer_imported",
    SFTP_FINANCIAL_DATA_IMPORTED: "sftp_financial_data_imported",
    SFTP_IMPORT_FAILED: "sftp_import_failed",
    CUSTOMER_IMPORTED: "customer_imported",
});