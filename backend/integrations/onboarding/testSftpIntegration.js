import { randomUUID } from "node:crypto";
import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { withSftpClient } from "../sftp/client.js";
import { assertConfigRevision, validateSftpSettings, SFTP_INTEGRATION_STATUSES } from "../sftp/sftpSettings.js";
import { buildRuntimeSftpConfig, getSftpIntegrationConfigRef } from "../sftp/sftpIntegrationConfig.js";
import { verifySftpAccess } from "./verifySftpAccess.js";
import { runSftpDiagnosticStep, toSftpDiagnosticError } from "../sftp/sftpDiagnostics.js";

export const testSftpIntegration = async ({
    institutionId,
    expectedRevision,
    clientFactory,
} = {}) => {
    assertConfigRevision(expectedRevision);

    const integrationRef = getSftpIntegrationConfigRef({ institutionId });
    const attemptId = randomUUID();

    const settings = await runSftpDiagnosticStep(
        { stage: "PREPARE_VERIFICATION" },
        () => db.runTransaction(async transaction => {
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
        }),
    );

    let stage = "BUILD_CONFIG";
    try {
        const config = buildRuntimeSftpConfig(settings);
        stage = "CONNECT";
        await withSftpClient({
            config,
            clientFactory,
            operation: client => verifySftpAccess({ client, settings }),
        });

        stage = "SAVE_VERIFICATION";
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
        const diagnostic = toSftpDiagnosticError(error, { stage });
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
        }).catch(resetError => {
            diagnostic.resetFailure = toSftpDiagnosticError(resetError, {
                stage: "RESET_VERIFICATION",
            });
        });

        throw diagnostic;
    }

    return {
        institutionId,
        verifiedRevision: expectedRevision,
        status: "VERIFIED",
    };
};
