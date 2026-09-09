import { withSftpClient } from "./client.js";
import { retryInvitationDeliverySpools } from "./retryDeliverySpool.js";

export const runDeliverySpoolRetry = async ({
    institutionId,
    pilotId,
    sftpConfig,
    outgoingDir,
    limit = 20,
    clientFactory,
} = {}) => {
    if (!institutionId || !pilotId)
        throw new Error("MISSING_IMPORT_SCOPE");

    if (!sftpConfig)
        throw new Error("MISSING_SFTP_CONFIG");

    if (!outgoingDir)
        throw new Error("MISSING_SFTP_OUTGOING_DIR");

    return withSftpClient({
        config: sftpConfig,
        clientFactory,
        operation: async client =>
            retryInvitationDeliverySpools({
                client,
                institutionId,
                pilotId,
                outgoingDir,
                limit,
            }),
    });
}