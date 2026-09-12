import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { assertConfigRevision, assertDocumentId, validateSftpSettings, SFTP_INTEGRATION_STATUSES } from "../sftp/sftpSettings.js";
import { getSftpIntegrationConfigRef } from "../sftp/sftpIntegrationConfig.js";

export const updateSftpIntegration = async ({
    institutionId,
    importPilotId,
    expectedRevision,
    sftpConfig,
} = {}) => {
    assertConfigRevision(expectedRevision);
    assertDocumentId(importPilotId, "MISSING_SFTP_IMPORT_PILOT_ID");

    const settings = validateSftpSettings(sftpConfig);
    const integrationRef = getSftpIntegrationConfigRef({ institutionId });
    const institutionRef = integrationRef.parent.parent;
    const pilotRef = institutionRef.collection("pilots").doc(importPilotId);

    return db.runTransaction(async transaction => {
        const [institution, integration, pilot] = await transaction.getAll(
            institutionRef,
            integrationRef,
            pilotRef,
        );

        if (!institution.exists || institution.data().status !== "ACTIVE")
            throw new Error("INSTITUTION_NOT_ACTIVE");

        if (!integration.exists)
            throw new Error("SFTP_INTEGRATION_NOT_FOUND");

        if (!pilot.exists || pilot.data().status !== "ACTIVE")
            throw new Error("IMPORT_PILOT_NOT_ACTIVE");

        const currentRevision = assertConfigRevision(
            integration.data().revision,
        );

        if (currentRevision !== expectedRevision)
            throw new Error("SFTP_CONFIG_REVISION_CONFLICT");

        const revision = assertConfigRevision(currentRevision + 1);

        transaction.update(integrationRef, {
            ...settings,
            importPilotId,
            revision,
            status: SFTP_INTEGRATION_STATUSES.DISABLED,
            verifiedRevision: null,
            verifiedAt: null,
            verificationAttemptId: null,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return {
            institutionId,
            pilotId: importPilotId,
            revision,
            status: SFTP_INTEGRATION_STATUSES.DISABLED,
        };
    });
};