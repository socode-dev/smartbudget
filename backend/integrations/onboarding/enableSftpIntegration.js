import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { assertConfigRevision, assertDocumentId, SFTP_INTEGRATION_STATUSES } from "../sftp/sftpSettings.js";
import { getSftpIntegrationConfigRef } from "../sftp/sftpIntegrationConfig.js";

export const enableSftpIntegration = async ({
    institutionId,
    expectedRevision,
} = {}) => {
    assertConfigRevision(expectedRevision);

    const integrationRef = getSftpIntegrationConfigRef({ institutionId });
    const institutionRef = integrationRef.parent.parent;

    return db.runTransaction(async transaction => {
        const [institution, integration] = await transaction.getAll(
            institutionRef,
            integrationRef,
        );

        if (!institution.exists || institution.data().status !== "ACTIVE")
            throw new Error("INSTITUTION_NOT_ACTIVE");

        if (!integration.exists)
            throw new Error("SFTP_INTEGRATION_NOT_FOUND");

        const data = integration.data();

        assertDocumentId(data.importPilotId, "MISSING_SFTP_IMPORT_PILOT_ID");

        const pilot = await transaction.get(
            institutionRef.collection("pilots").doc(data.importPilotId),
        );

        if (!pilot.exists || pilot.data().status !== "ACTIVE")
            throw new Error("IMPORT_PILOT_NOT_ACTIVE");

        if (data.revision !== expectedRevision)
            throw new Error("SFTP_CONFIG_REVISION_CONFLICT");

        if (
            data.verifiedRevision !== expectedRevision ||
            data.verificationAttemptId
        )
            throw new Error("SFTP_CONFIGURATION_NOT_VERIFIED");

        if (!Object.values(SFTP_INTEGRATION_STATUSES).includes(data.status))
            throw new Error("INVALID_SFTP_INTEGRATION_STATUS");

        if (data.status !== SFTP_INTEGRATION_STATUSES.ACTIVE) {
            transaction.update(integrationRef, {
                status: SFTP_INTEGRATION_STATUSES.ACTIVE,
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        return {
            institutionId,
            pilotId: data.importPilotId,
            revision: expectedRevision,
            status: SFTP_INTEGRATION_STATUSES.ACTIVE,
        };
    });
};