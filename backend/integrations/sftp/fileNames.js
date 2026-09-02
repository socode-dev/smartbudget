import { IMPORT_FILE_TYPES } from "../import/importTypes.js";

const FILE_NAME_PATTERN =
    /^(customers|transactions)_(\d{8})_(\d{6})_([a-zA-Z0-9-]+)\.csv$/;

export const parseSftpImportFileName = (fileName) => {
    const match = String(fileName ?? "").match(FILE_NAME_PATTERN);

    if (!match) {
        throw new Error("INVALID_SFTP_FILE_NAME");
    }

    const [, type, date, time, batchId] = match;

    return {
        fileType:
            type === "customers"
                ? IMPORT_FILE_TYPES.CUSTOMERS
                : IMPORT_FILE_TYPES.TRANSACTIONS,
        date,
        time,
        batchId,
    };
};

export const isAllowedSftpCsvFile = (fileName) => {
    try {
        parseSftpImportFileName(fileName);
        return true;
    } catch {
        return false;
    }
};

export const sortSftpFilesForProcessing = (files = []) =>
[...files].sort((a, b) => {
    const aMeta = parseSftpImportFileName(a.name);
    const bMeta = parseSftpImportFileName(b.name);

    if (aMeta.date !== bMeta.date) return aMeta.date.localeCompare(bMeta.date);
    if (aMeta.time !== bMeta.time) return aMeta.time.localeCompare(bMeta.time);

    const typePriority = {
        [IMPORT_FILE_TYPES.CUSTOMERS]: 0,
        [IMPORT_FILE_TYPES.TRANSACTIONS]: 1,
    };

    const priorityDiff =
        typePriority[aMeta.fileType] - typePriority[bMeta.fileType];

    if (priorityDiff !== 0) return priorityDiff;

    return a.name.localeCompare(b.name);
});