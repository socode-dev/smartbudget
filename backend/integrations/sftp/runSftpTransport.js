import { createSftpConfigFromEnv, withSftpClient } from "./client.js";
import { handleIncomingFile } from "./handleIncomingFile.js";
import { listIncomingFiles } from "./remoteFiles.js";

export const runSftpTransport = async ({
    institutionId,
    pilotId,
    cohortId = null,
    sftpConfig = createSftpConfigFromEnv(),
    incomingDir = process.env.SFTP_INCOMING_DIR || "/incoming",
    processingDir = process.env.SFTP_PROCESSING_DIR || "/processing",
    processedDir = process.env.SFTP_PROCESSED_DIR || "/processed",
    failedDir = process.env.SFTP_FAILED_DIR || "/failed",
    outgoingDir = process.env.SFTP_OUTGOING_DIR || "/outgoing",
    hmacSecret = process.env.SFTP_IMPORT_HMAC_SECRET,
    activationBaseUrl = process.env.SMARTBUDGET_ACTIVATION_BASE_URL,
    clientFactory,
    importer
} = {}) => {
    if (!institutionId || !pilotId) throw new Error("MISSING_IMPORT_SCOPE");

    return withSftpClient({
        config: sftpConfig,
        clientFactory,
        operation: async (client) => {
            const files = await listIncomingFiles({ client, incomingDir });
            const results = [];

            for (const file of files) {
                const result = await handleIncomingFile({
                    client,
                    file,
                    institutionId,
                    pilotId,
                    cohortId,
                    hmacSecret,
                    activationBaseUrl,
                    processingDir,
                    processedDir,
                    failedDir,
                    outgoingDir,
                    importer,
                });

                results.push(result);
            }

            return {
                ok: results.every(result => result.ok),
                fileCount: files.length,
                processedCount: results.filter(result => result.ok).length,
                failedCount: results.filter(result => !result.ok).length,
                results,
            };
        },
    });
};