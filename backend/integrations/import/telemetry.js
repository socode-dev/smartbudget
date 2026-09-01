import { logBusinessEvent } from "../../ai/telemetry/businessLogger.js";

const getImportedUserId = (institutionId) => {
    return `importer_${String(institutionId).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
};

export const logImportBusinessEvent = async ({
    institutionId,
    pilotId,
    cohortId = null,
    importId = null,
    eventType,
    metadata = {}
}) => {
    if (!institutionId || !eventType) return false;

    return logBusinessEvent({
        userId: getImportedUserId(institutionId),
        eventType,
        institutionId,
        pilotId,
        cohortId,
        importId,
        source: "sftp_import",
        dataSource: "sftp_institution_import",
        enrollmentSource: "institution_sftp_import",
        writeSubjectEvent: false,
        metadata,
    });
};

export const logCustomerBusinessEvent = async ({
    userId,
    institutionId,
    pilotId,
    cohortId = null,
    importId = null,
    eventType,
    metadata ={}
} = {}) => {
    if (!userId || !eventType) return false;

    return logBusinessEvent({
        userId,
        eventType,
        institutionId,
        pilotId,
        cohortId,
        importId,
        source: "sftp_import",
        dataSource: "sftp_institution_import",
        enrollmentSource: "institution_sftp_import",
        subjectCollection: "pilotCustomers",
        metadata,
    });
};
