import { randomUUID } from "node:crypto";
import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { withSftpClient } from "../sftp/client.js";
import { assertConfigRevision, validateSftpSettings, SFTP_INTEGRATION_STATUSES } from "../sftp/sftpSettings.js";
import { buildRuntimeSftpConfig, getSftpIntegrationConfigRef } from "../sftp/sftpIntegrationConfig.js";
import { verifySftpAccess } from "./verifySftpAccess.js";

export const testSftpIntegration = async ({
    institutionId,
    expectedRevision,
    clientFactory,
} = {}) => {
    assertConfigRevision(expectedRevision);

    const integrationRef = getSftpIntegrationConfigRef({ institutionId });
    const attemptId = randomUUID();

    const settings = await db.runTransaction(async transaction => {
        const snapshot = await transaction.get(integrationRef);

        if (!snapshot.exists)
            throw new Error("SFTP_INTEGRATION_NOT_FOUND");

        const data = snapshot.data();

        if (data.status !== SFTP_INTEGRATION_STATUSES.DISABLED)
            throw new Error("SFTP_TEST_REQUIRES_DISABLED_INTEGRATION");

        if (data.revision !== expectedRevision)
            throw new Error("SFTP_CONFIG_REVISION_CONFLICT");

        const validated = validateSftpSettings(data);

        transaction.update(integrationRef, {
            verifiedRevision: null,
            verifiedAt: null,
            verificationAttemptId: attemptId,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return validated;
    });

    try {
        await withSftpClient({
            config: buildRuntimeSftpConfig(settings),
            clientFactory,
            operation: client => verifySftpAccess({ client, settings }),
        });

        await db.runTransaction(async transaction => {
            const snapshot = await transaction.get(integrationRef);
            const data = snapshot.data();

            if (
                !snapshot.exists ||
                data.status !== SFTP_INTEGRATION_STATUSES.DISABLED ||
                data.revision !== expectedRevision ||
                data.verificationAttemptId !== attemptId
            )
                throw new Error("SFTP_CONFIGURATION_CHANGED_DURING_TEST");

            transaction.update(integrationRef, {
                verifiedRevision: expectedRevision,
                verifiedAt: FieldValue.serverTimestamp(),
                verificationAttemptId: null,
                updatedAt: FieldValue.serverTimestamp(),
            });
        });
    } catch (error) {
        await db.runTransaction(async transaction => {
            const snapshot = await transaction.get(integrationRef);
            const data = snapshot.data();

            if (
                snapshot.exists &&
                data.revision === expectedRevision &&
                data.verificationAttemptId === attemptId
            ) {
                transaction.update(integrationRef, {
                    verifiedRevision: null,
                    verifiedAt: null,
                    verificationAttemptId: null,
                    updatedAt: FieldValue.serverTimestamp(),
                });
            }
        }).catch(() => {});

        const safeErrors = new Set([
            "MISSING_SFTP_PRIVATE_KEY",
            "SFTP_PROBE_CLEANUP_FAILED",
            "SFTP_CONFIGURATION_CHANGED_DURING_TEST",
        ]);

        throw new Error(
            safeErrors.has(error.message)
                ? error.message
                : "SFTP_ACCESS_TEST_FAILED",
        );
    }

    return {
        institutionId,
        verifiedRevision: expectedRevision,
        status: "VERIFIED",
    };
};