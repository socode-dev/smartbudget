import { createHash, randomUUID } from "crypto";
import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { parseCsv } from "./parseCsv.js";
import { validateCsv } from "./validateCsv.js";
import {
    BUSINESS_EVENTS,
    IMPORT_FILE_TYPES,
    IMPORT_SOURCE,
    IMPORT_STATUSES
} from "./importTypes.js";
import { processCustomers } from "./processCustomers.js";
import { processTransactions } from "./processTransactions.js";
import { logImportBusinessEvent } from "./telemetry.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const validateFileSize = (fileContent) => {
    const size = Buffer.byteLength(
        String(fileContent),
        "utf8"
    );

    if (size > MAX_FILE_SIZE_BYTES) {
        const error = new Error("FILE_SIZE_LIMIT_EXCEEDED");
        error.code = "FILE_SIZE_LIMIT_EXCEEDED";
        throw error;
    }
};

const validateFileExtension = (fileName) => {
    if (!String(fileName).toLowerCase().endsWith(".csv")) {
        const error = new Error("UNSUPPORTED_FILE_EXTENSION");
        error.code = "UNSUPPORTED_FILE_EXTENSION";
        throw error;
    }
};

export const processImport = async ({
    institutionId,
    pilotId,
    cohortId = null,
    fileName,
    fileType,
    fileContent,
    source = IMPORT_SOURCE.SFTP,
    hmacSecret = process.env.SFTP_IMPORT_HMAC_SECRET,
    activationBaseUrl = process.env.SMARTBUDGET_ACTIVATION_BASE_URL,
} = {}) => {
    if (!institutionId || !pilotId) throw new Error("MISSING_IMPORT_SCOPE");
    if (!fileName || !fileType || !fileContent) throw new Error("MISSING_IMPORT_FILE");
    
    validateFileExtension(fileName);
    validateFileSize(fileContent);

    const importId = `import_${randomUUID()}`;
    const fileHash = createHash("sha256").update(String(fileContent)).digest("hex");
    const importRef = getImportRef({ institutionId, pilotId, importId });
    const startedAtMs = Date.now();

    await logImportBusinessEvent({
        institutionId,
        pilotId,
        cohortId,
        importId,
        eventType: BUSINESS_EVENTS.SFTP_IMPORT_RECEIVED,
        metadata: {
            fileName,
            fileType,
            fileHash,
        },
    });

    try {

        const duplicateImport = await findDuplicateImport({
            institutionId,
            pilotId,
            fileHash,
        });

        if (duplicateImport) {
            await importRef.set(
                buildImportRecord({
                    importId,
                    institutionId,
                    pilotId,
                    fileName,
                    fileType,
                    fileHash,
                    status: IMPORT_STATUSES.SKIPPED_DUPLICATE_FILE,
                    startedAtMs,
                    processedAtMs: Date.now(),
                })
            );

            await logImportBusinessEvent({
                institutionId,
                pilotId,
                cohortId,
                importId,
                eventType: BUSINESS_EVENTS.SFTP_IMPORT_PROCESSED,
                metadata: {
                    fileName,
                    fileType,
                    duplicate: true,
                    duplicateOf: duplicateImport.id,
                },
            });

            return {
                ok: true,
                importId,
                status: IMPORT_STATUSES.SKIPPED_DUPLICATE_FILE,
                duplicateOf: duplicateImport.id,
            };
        }

        const parsed =  parseCsv({ fileContent });
        const validationErrors = validateCsv({
            rows: parsed.rows,
            fileType,
        });

        const errors = [...parsed.errors, ...validationErrors];

        if (errors.length) {
            await importRef.set(
                buildImportRecord({
                    importId,
                    institutionId,
                    pilotId,
                    fileName,
                    fileType,
                    fileHash,
                    status: IMPORT_STATUSES.FAILED_VALIDATION,
                    totalRows: parsed.rows.length,
                    rejectedRows: parsed.rows.length,
                    errors,
                    startedAtMs,
                    processedAtMs: Date.now(),
                })
            );

            await logImportBusinessEvent({
                institutionId,
                pilotId,
                cohortId,
                importId,
                eventType: BUSINESS_EVENTS.SFTP_IMPORT_FAILED,
                metadata: {
                    fileName,
                    fileType,
                    totalRows: parsed.rows.length,
                    rejectedRows: parsed.rows.length,
                    reasonCode: IMPORT_STATUSES.FAILED_VALIDATION,
                    errorCount: errors.length,
                },
            });

            return {
                ok: false,
                importId,
                status: IMPORT_STATUSES.FAILED_VALIDATION,
                errors,
            };
        }

        const result = await processRowsByType({
            rows: parsed.rows,
            fileType,
            institutionId,
            pilotId,
            cohortId,
            importId,
            source,
            hmacSecret,
            activationBaseUrl,
        });

        await importRef.set(
            buildImportRecord({
                importId,
                institutionId,
                pilotId,
                fileName,
                fileType,
                fileHash,
                status: IMPORT_STATUSES.PROCESSED,
                totalRows: parsed.rows.length,
                acceptedRows: result.acceptedRows,
                skippedRows: result.skippedRows ?? 0,
                duplicateRows: result.duplicateRows,
                rejectedRows: result.rejectedRows ?? 0,
                affectedImportCustomerIds: result.affectedImportCustomerIds ?? [],
                affectedUserIds: result.affectedUserIds ?? [],
                inviteCreatedCount: result.createdInvites?.length ?? 0,
                startedAtMs,
                processedAtMs: Date.now(),
            })
        );

        await logImportBusinessEvent({
            institutionId,
            pilotId,
            cohortId,
            importId,
            eventType: BUSINESS_EVENTS.SFTP_IMPORT_PROCESSED,
            metadata: {
                fileName,
                fileType,
                totalRows: parsed.rows.length,
                acceptedRows: result.acceptedRows,
                skippedRows: result.skippedRows ?? 0,
                duplicateRows: result.duplicateRows,
                rejectedRows: result.rejectedRows ?? 0,
            },
        });

        const {
            inviteExports = [],
            ...safeResult
        } = result;

        return {
            ok: true,
            importId,
            status: IMPORT_STATUSES.PROCESSED,
            ...safeResult,
            inviteExports,
        };
    } catch (err) {
        await importRef.set(
            buildImportRecord({
                importId,
                institutionId,
                pilotId,
                fileName,
                fileType,
                fileHash,
                status: IMPORT_STATUSES.FAILED_PROCESSING,
                errors: [
                    {
                        code: err.code || err.message || "IMPORT_FAILED",
                    },
                ],
                startedAtMs,
                processedAtMs: Date.now(),
            }),
            { merge: true }
        );

        await logImportBusinessEvent({
            institutionId,
            pilotId,
            cohortId,
            importId,
            eventType: BUSINESS_EVENTS.SFTP_IMPORT_FAILED,
            metadata: {
                fileName,
                fileType,
                reasonCode: err.code || err.message || "IMPORT_FAILED",
            },
        });

        throw err;
    }
};

const processRowsByType = (args) => {
    switch (args.fileType) {
        case IMPORT_FILE_TYPES.CUSTOMERS:
            return processCustomers(args);
        
        case IMPORT_FILE_TYPES.TRANSACTIONS:
            return processTransactions(args);

        default:
            throw new Error("UNSUPPORTED_FILE_TYPE");
    }
};

const getImportRef = ({ institutionId, pilotId, importId }) => {
    return db
    .collection("institutions")
    .doc(institutionId)
    .collection("pilots")
    .doc(pilotId)
    .collection("imports")
    .doc(importId);
};

const findDuplicateImport = async ({ institutionId, pilotId, fileHash }) => {
    const snapshot = await db
    .collection("institutions")
    .doc(institutionId)
    .collection("pilots")
    .doc(pilotId)
    .collection("imports")
    .where("fileHash", "==", fileHash)
    .limit(1)
    .get();

    return snapshot.docs.find(doc => {
        const status = doc.data().status;

        return [
            IMPORT_STATUSES.PROCESSED,
            IMPORT_STATUSES.SKIPPED_DUPLICATE_FILE,
        ].includes(status);
    }) ?? null;
};

const buildImportRecord = ({
    importId,
    institutionId,
    pilotId,
    fileName,
    fileType,
    fileHash,
    status,
    totalRows = 0,
    acceptedRows = 0,
    skippedRows = 0,
    duplicateRows = 0,
    rejectedRows = 0,
    errors = [],
    affectedImportCustomerIds = [],
    affectedUserIds = [],
    inviteCreatedCount = 0,
    startedAtMs,
    processedAtMs = null,
}) => ({
    importId,
    institutionId,
    pilotId,
    fileName,
    fileType,
    fileHash,
    status,
    totalRows,
    acceptedRows,
    skippedRows,
    duplicateRows,
    rejectedRows,
    errors,
    affectedImportCustomerIds,
    affectedUserIds,
    inviteCreatedCount,
    startedAtMs,
    processedAtMs,
    updatedAt: FieldValue.serverTimestamp(),
});
