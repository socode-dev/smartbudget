import {
    decryptSpoolPayload,
    deleteInvitationDeliverySpool,
    listRetryableInvitationDeliverySpools,
    markInvitationDeliveryFailed
} from "./deliverySpool.js"
import {
    ensureRemoteDir,
    joinRemotePath,
    uploadRemoteTextFile,
} from "./remoteFiles.js";

export const retry = async (operation, attempts = 3) => {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await operation();
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError;
};

export const retryInvitationDeliverySpools = async ({
    client,
    institutionId,
    pilotId,
    outgoingDir = process.env.SFTP_OUTGOING_DIR || "/outgoing",
    limit = 20,
} = {}) => {
    if (!client)
        throw new Error("MISSING_SFTP_CLIENT");

    if (!institutionId || !pilotId)
        throw new Error("MISSING_IMPORT_SCOPE");

    const spools = await listRetryableInvitationDeliverySpools({
        institutionId,
        pilotId,
        limit
    });

    const results = [];

    for (const spool of spools) {
        const data = spool.data;
        const spoolId =  data.spoolId;

        try {
            const { invitationCsv } = decryptSpoolPayload(data);

            const remotePath = joinRemotePath(outgoingDir, data.invitationFileName);

            await ensureRemoteDir({ client, remoteDir: outgoingDir });

            await retry(() => 
                uploadRemoteTextFile({
                    client,
                    remotePath,
                    fileContent: invitationCsv,
                }),
            );

            await deleteInvitationDeliverySpool({
                institutionId,
                pilotId,
                spoolId,
            });

            results.push({
                ok: true,
                spoolId,
                invitationFileName: data.invitationFileName,
                remotePath,
            });
        } catch (err) {
            await markInvitationDeliveryFailed({
                institutionId,
                pilotId,
                spoolId,
                errorCode: err.code || err.message || "INVITATION_RETRY_FAILED",
            });

            results.push({
                ok: false,
                spoolId,
                invitationFileName: data.invitationFileName,
                errorCode: err.code || err.message || "INVITATION_RETRY_FAILED",
            });
        }
    }

    return {
        ok: results.every(result => result.ok),
        checkedCount: spools.length,
        deliveredCount: results.filter(result => result.ok).length,
        failedCount: results.filter(result => !result.ok),
        results,
    };
};