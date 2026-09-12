import { discoverActiveSftpIntegrations } from "./discoverActiveSftpIntegrations.js";
import { getSftpImportIntegrationConfig } from "./sftpIntegrationConfig.js";
import { runSftpTransport } from "./runSftpTransport.js";

const SAFE_ERROR_CODES = new Set([
    "INSTITUTION_NOT_ACTIVE",
    "IMPORT_PILOT_NOT_ACTIVE",
    "SFTP_INTEGRATION_NOT_FOUND",
    "SFTP_INTEGRATION_DISABLED",
    "SFTP_INTEGRATION_NOT_ACTIVE",
    "MISSING_SFTP_PRIVATE_KEY",
    "MISSING_SFTP_IMPORT_PILOT_ID",
    "INVALID_SFTP_CONFIG_REVISION",
    "INVALID_SFTP_HOST_FINGERPRINT",
    "SFTP_CONFIGURATION_NOT_VERIFIED",
]);

const safeErrorCode = error => {
    const candidate = error?.code || error?.message;

    if (SAFE_ERROR_CODES.has(candidate)) return candidate;

    if (
        typeof candidate === "string" &&
        candidate.startsWith("INVALID_SFTP_INTEGRATION_CONFIG")
    )
        return "INVALID_SFTP_INTEGRATION_CONFIG";

    return "SFTP_TRANSPORT_SCOPE_FAILED";
};

const readImportRuntime = () => {
    const hmacSecret = process.env.SFTP_IMPORT_HMAC_SECRET;
    const activationBaseUrl = process.env.SMARTBUDGET_ACTIVATION_BASE_URL;
    const spoolKey = process.env.SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY;

    if (!hmacSecret)
        throw new Error("MISSING_SFTP_IMPORT_HMAC_SECRET");

    if (!spoolKey || Buffer.from(spoolKey, "base64").length !== 32)
        throw new Error("INVALID_SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY");

    let url;

    try {
        url = new URL(activationBaseUrl);
    } catch {
        throw new Error("INVALID_ACTIVATION_BASE_URL");
    }

    if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
    )
        throw new Error("INVALID_ACTIVATION_BASE_URL");

    return {
        hmacSecret,
        activationBaseUrl,
    };
};

const readCount = value =>
    Number.isSafeInteger(value) && value >= 0 ? value : 0;

export const runAllSftpTransports = async ({
    discoverIntegrations = discoverActiveSftpIntegrations,
    loadIntegrationConfig = getSftpImportIntegrationConfig,
    runTransport = runSftpTransport,
} = {}) => {
    const integrations = await discoverIntegrations();

    const summary = {
        ok: true,
        discoveredInstitutionCount: integrations.length,
        attemptedInstitutionCount: 0,
        successfulInstitutionCount: 0,
        failedInstitutionCount: 0,
        discoveredFileCount: 0,
        processedFileCount: 0,
        failedFileCount: 0,
        failureCounts: {},
    };

    if (!integrations.length) return summary;

    const runtime = readImportRuntime();

    const recordFailure = code => {
        summary.failedInstitutionCount += 1;
        summary.failureCounts[code] =
            (summary.failureCounts[code] || 0) + 1;
    };

    for (const { institutionId } of integrations) {
        summary.attemptedInstitutionCount += 1;

        try {
            const integration = await loadIntegrationConfig({ institutionId });

            const result = await runTransport({
                institutionId,
                pilotId: integration.pilotId,
                sftpConfig: integration.sftpConfig,
                incomingDir: integration.incomingDir,
                processingDir: integration.processingDir,
                processedDir: integration.processedDir,
                failedDir: integration.failedDir,
                outgoingDir: integration.outgoingDir,
                ...runtime,
            });

            summary.discoveredFileCount += readCount(result.fileCount);
            summary.processedFileCount += readCount(result.processedCount);
            summary.failedFileCount += readCount(result.failedCount);

            if (result.ok) {
                summary.successfulInstitutionCount += 1;
            } else {
                recordFailure("SFTP_IMPORT_FILES_FAILED");
            }
        } catch (error) {
            recordFailure(safeErrorCode(error));
        }
    }

    summary.ok = summary.failedInstitutionCount === 0;

    return summary;
};