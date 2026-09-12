import { db } from "../../../lib/firebaseAdmin.js";
import {
    assertConfigRevision,
    assertDocumentId,
    validateSftpSettings,
    SFTP_INTEGRATION_STATUSES,
} from "./sftpSettings.js";

export { SFTP_INTEGRATION_STATUSES } from "./sftpSettings.js";

export const getSftpIntegrationConfigRef = ({ institutionId } = {}) => {
    assertDocumentId(institutionId, "MISSING_INSTITUTION_ID");

    return db
        .collection("institutions")
        .doc(institutionId)
        .collection("integrations")
        .doc("sftp");
};

export const buildRuntimeSftpConfig = settings => {
    const privateKey = process.env.SFTP_PRIVATE_KEY;
    const passphrase = process.env.SFTP_PRIVATE_KEY_PASSPHRASE;

    if (typeof privateKey !== "string" || !privateKey.trim())
        throw new Error("MISSING_SFTP_PRIVATE_KEY");

    return {
        host: settings.host,
        port: settings.port,
        username: settings.username,
        hostFingerprintSha256: settings.hostFingerprintSha256,
        privateKey: privateKey.replace(/\\n/g, "\n"),
        readyTimeout: 20000,
        ...(passphrase ? { passphrase } : {}),
    };
};

export const readSftpIntegrationConfig = async ({ institutionId } = {}) => {
    const snapshot = await getSftpIntegrationConfigRef({ institutionId }).get();

    if (!snapshot.exists)
        throw new Error("SFTP_INTEGRATION_NOT_FOUND");

    const data = snapshot.data();

    return {
        institutionId,
        ...validateSftpSettings(data),
        status: data.status,
        importPilotId: data.importPilotId ?? null,
        revision: data.revision ?? null,
        verifiedRevision: data.verifiedRevision ?? null,
        verificationAttemptId: data.verificationAttemptId ?? null,
    };
};

export const getSftpIntegrationConfig = async ({ institutionId } = {}) => {
    const integration = await readSftpIntegrationConfig({ institutionId });

    if (integration.status === SFTP_INTEGRATION_STATUSES.DISABLED)
        throw new Error("SFTP_INTEGRATION_DISABLED");

    if (integration.status !== SFTP_INTEGRATION_STATUSES.ACTIVE)
        throw new Error("SFTP_INTEGRATION_NOT_ACTIVE");

    return {
        ...integration,
        sftpConfig: buildRuntimeSftpConfig(integration),
    };
};

export const getSftpImportIntegrationConfig = async ({ institutionId } = {}) => {
    const integration = await getSftpIntegrationConfig({ institutionId });

    assertDocumentId(
        integration.importPilotId,
        "MISSING_SFTP_IMPORT_PILOT_ID",
    );
    assertConfigRevision(integration.revision);

    if (
        integration.verifiedRevision !== integration.revision ||
        integration.verificationAttemptId
    )
        throw new Error("SFTP_CONFIGURATION_NOT_VERIFIED");

    const institutionRef = db.collection("institutions").doc(institutionId);
    const pilotRef = institutionRef
        .collection("pilots")
        .doc(integration.importPilotId);

    const [institution, pilot] = await db.getAll(institutionRef, pilotRef);

    if (!institution.exists || institution.data().status !== "ACTIVE")
        throw new Error("INSTITUTION_NOT_ACTIVE");

    if (!pilot.exists || pilot.data().status !== "ACTIVE")
        throw new Error("IMPORT_PILOT_NOT_ACTIVE");

    return {
        ...integration,
        pilotId: integration.importPilotId,
    };
};