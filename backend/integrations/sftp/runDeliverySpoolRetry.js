import { createSftpConfigFromEnv, withSftpClient } from "./client.js";
import { retryInvitationDeliverySpools } from "./retryDeliverySpool.js";

export const runDeliverySpoolRetry = async ({
    institutionId,
    pilotId,
    sftpConfig = createSftpConfigFromEnv(),
    outgoingDir = process.env.SFTP_OUTGOING_DIR || "/outgoing",
    limit = 20,
    clientFactory,
} = {}) => {
    if (!institutionId || !pilotId)
        throw new Error("MISSING_IMPORT_SCOPE");

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