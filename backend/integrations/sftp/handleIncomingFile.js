import { IMPORT_FILE_TYPES, IMPORT_SOURCE } from "../import/importTypes.js";
import { processImport } from "../import/processImport.js";
import { parseSftpImportFileName } from "./fileNames.js";
import {
    ensureRemoteDir,
    joinRemotePath,
    moveRemoteFile,
    readRemoteFile,
    uploadRemoteTextFile,
} from "./remoteFiles.js";
import {
    buildInvitationCsv,
    buildInvitationExportFileName,
} from "./invitationExport.js";
import {
    createInvitationDeliverySpool,
    deleteInvitationDeliverySpool,
    markInvitationDeliveryFailed,
} from "./deliverySpool.js";
import { retry } from "./retryDeliverySpool.js";

const MAX_SFTP_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const assertRemoteFileSizeAllowed = ({
    file,
    maxFileSizeBytes = MAX_SFTP_FILE_SIZE_BYTES,
} = {}) => {
    if (typeof file.size !== "number")
        throw new Error("MISSING_REMOTE_FILE_SIZE");

if (file.size > maxFileSizeBytes) {
    const error = new Error("SFTP_FILE_SIZE_LIMIT_EXCEEDED");
    error.code = "SFTP_FILE_SIZE_LIMIT_EXCEEDED";
    throw error;
}
}

export const claimIncomingFile = async ({
    client,
    file,
    processingDir = "/processing",
} = {}) => {
    const processingPath = await moveRemoteFile({
        client,
        fromPath: file.remotePath,
        toDir: processingDir,
        fileName: file.name,
    });

    return {
        ...file,
        remotePath: processingPath,
    };
};

export const handleIncomingFile = async ({
    client,
    file,
    institutionId,
    pilotId,
    cohortId = null,
    hmacSecret = process.env.SFTP_IMPORT_HMAC_SECRET,
    activationBaseUrl = process.env.SMARTBUDGET_ACTIVATION_BASE_URL,
    processingDir = "/processing",
    processedDir = "/processed",
    failedDir = "/failed",
    outgoingDir = "/outgoing",
    importer = processImport,
} = {}) => {
    if (!client) 
        throw new Error("MISSING_SFTP_CLIENT");

    if (!file?.name || !file?.remotePath) 
        throw new Error("MISSING_SFTP_FILE");
    
    if (!institutionId || !pilotId) 
        throw new Error("MISSING_IMPORT_SCOPE");

    const fileMeta = parseSftpImportFileName(file.name);
    const claimedFile = await claimIncomingFile({ client, file, processingDir });

    
    try {
        assertRemoteFileSizeAllowed({ file: claimedFile });
        
        const fileContent = await readRemoteFile({
            client,
            remotePath: claimedFile.remotePath,
        });

        const importResult = await importer({
            institutionId,
            pilotId,
            cohortId,
            fileName: claimedFile.name,
            fileType: fileMeta.fileType,
            fileContent,
            source: IMPORT_SOURCE.SFTP,
            hmacSecret,
            activationBaseUrl,
        });

        let invitationExportPath = null;
        let deliverySpoolId = null;

        if (
            fileMeta.fileType === IMPORT_FILE_TYPES.CUSTOMERS && 
            importResult.inviteExports?.length
        ) {
            const invitationCsv = buildInvitationCsv(importResult.inviteExports);
            const invitationFileName = buildInvitationExportFileName({
                batchId: fileMeta.batchId,
                importId: importResult.importId,
            });

            const spool = await createInvitationDeliverySpool({
                institutionId,
                pilotId,
                importId: importResult.importId,
                fileName: claimedFile.name,
                batchId: fileMeta.batchId,
                invitationFileName,
                invitationCsv,
            });

            deliverySpoolId = spool.spoolId;
            invitationExportPath = joinRemotePath(outgoingDir, invitationFileName);

            try {
                await ensureRemoteDir({ client, remoteDir: outgoingDir });
                
                await retry(() =>
                    uploadRemoteTextFile({
                        client,
                        remotePath: invitationExportPath,
                        fileContent: invitationCsv,
                    }),
                );

                await deleteInvitationDeliverySpool({
                    institutionId,
                    pilotId,
                    spoolId: deliverySpoolId,
                });
            } catch (err) {
                await markInvitationDeliveryFailed({
                    institutionId,
                    pilotId,
                    spoolId: deliverySpoolId,
                    errorCode: err.code || err.message || "INVITATION_EXPORT_FAILED",
                });

                throw err;
            }
        }

        const processedPath = await moveRemoteFile({
            client,
            fromPath: claimedFile.remotePath,
            toDir: processedDir,
            fileName: claimedFile.name
        });

        const { inviteExports, ...safeImportResult } = importResult;

        return {
            ok: true,
            fileName: claimedFile.name,
            fileType: fileMeta.fileType,
            processedPath,
            invitationExportPath,
            inviteExportCount: inviteExports?.length ?? 0,
            safeImportResult,
        }
    } catch (err) {
        const failedPath = await moveRemoteFile({
            client,
            fromPath: claimedFile.remotePath,
            toDir: failedDir,
            fileName: claimedFile.name,
        }).catch(() => null);

        return {
            ok: false,
            fileName: claimedFile.name,
            fileType: fileMeta.fileType,
            failedPath,
            errorCode: err.code || err.message || "SFTP_FILE_FAILED",
        };
    }
};