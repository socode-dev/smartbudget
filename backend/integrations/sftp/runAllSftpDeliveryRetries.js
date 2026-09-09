import { discoverRetryableDeliveryScopes } from "./discoverRetryableDeliveryScopes.js";
import { getSftpIntegrationConfig } from "./sftpIntegrationConfig.js";
import { runDeliverySpoolRetry } from "./runDeliverySpoolRetry.js";

const SAFE_ERROR_CODES = new Set([
    "SFTP_INTEGRATION_NOT_FOUND",
    "SFTP_INTEGRATION_DISABLED",
    "SFTP_INTEGRATION_NOT_ACTIVE",
    "MISSING_SFTP_PRIVATE_KEY",
    "MISSING_SFTP_PRIVATE_KEY_PASSPHRASE",
    "MISSING_SFTP_CONFIG",
    "MISSING_SFTP_OUTGOING_DIR",
]);

const getSafeErrorCode = error => {
    const candidate = error?.code || error?.message;

    return SAFE_ERROR_CODES.has(candidate)
        ? candidate
        : "SFTP_SCOPE_RETRY_FAILED";
};

const addFailure = (failureCounts, errorCode) =>
    failureCounts[errorCode] = (failureCounts[errorCode] || 0) + 1;

const readCount = value =>
    Number.isInteger(value) && value >= 0 ? value : 0;

export const runAllSftpDeliveryRetries = async ({
    limitPerScope = 20,
    discoverScopes = discoverRetryableDeliveryScopes,
    loadIntegrationConfig = getSftpIntegrationConfig,
    runScopeRetry = runDeliverySpoolRetry,
} = {}) => {
    const scopes = await discoverScopes();

    const summary = {
        ok: true,
        discoveredScopeCount: scopes.length,
        attemptedScopeCount: 0,
        successfulScopeCount: 0,
        failedScopeCount: 0,
        checkedDeliveryCount: 0,
        deliveredCount: 0,
        failedDeliveryCount: 0,
        failureCounts: {},
    };

    for (const scope of scopes) {
        summary.attemptedScopeCount += 1;

        try {
            const integration = await loadIntegrationConfig({ institutionId: scope.institutionId });

            const result = await runScopeRetry({
                institutionId: scope.institutionId,
                pilotId: scope.pilotId,
                sftpConfig: integration.sftpConfig,
                outgoingDir: integration.outgoingDir,
                limit:limitPerScope,
            });

            summary.checkedDeliveryCount += readCount(result.checkedCount);
            summary.deliveredCount += readCount(result.deliveredCount);
            summary.failedDeliveryCount += readCount(result.failedCount);

            if (result.ok) {
                summary.successfulScopeCount += 1;
            } else {
                summary.failedScopeCount += 1;
                addFailure(summary.failureCounts, "DELIVERY_RETRY_FAILED");
            }
        } catch (err) {
            summary.failedScopeCount += 1;
            addFailure(summary.failureCounts, getSafeErrorCode(err));
        }
    }

    summary.ok = summary.failedScopeCount === 0;

    return summary;
}