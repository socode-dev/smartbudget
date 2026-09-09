import { db } from "../../../lib/firebaseAdmin.js";

export const SFTP_INTEGRATION_STATUSES = Object.freeze({
    ACTIVE: "ACTIVE",
    DISABLED: "DISABLED",
});

const REQUIRED_STRING_FIELDS = [
    "host",
    "username",
    "hostFingerprintSha256",
    "incomingDir",
    "processingDir",
    "processedDir",
    "failedDir",
    "outgoingDir",
];

const DIRECTORY_FILEDS = [
    "incomingDir",
    "processingDir",
    "processedDir",
    "failedDir",
    "outgoingDir",
];

export const getSftpIntegrationConfigRef = ({ institutionId } = {}) => {
    if (!institutionId)
        throw new Error("MISSING_INSTITUTION_ID");

    return db
        .collection("institutions")
        .doc(institutionId)
        .collection("integrations")
        .doc("sftp");
};

const validatePersistedConfig = (config = {}) => {
    if (config.status === SFTP_INTEGRATION_STATUSES.DISABLED)
        throw new Error("SFTP_INTEGRATION_DISABLED");

    if (config.status !== SFTP_INTEGRATION_STATUSES.ACTIVE)
        throw new Error("SFTP_INTEGRATION_NOT_ACTIVE");

    for (const field of REQUIRED_STRING_FIELDS) {
        if (typeof config[field] !== "string" || !config[field].trim())
            throw new Error(`INVALID_SFTP_INTEGRATION_CONFIG:${field}`);
    };

    const port = Number(config.port);

    if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error("INVALID_SFTP_INTEGRATION_CONFIG:port");

    for (const field of DIRECTORY_FILEDS) {
        const segment = config[field].split("/");

        if (!config[field].startsWith("/") || segment.includes(".."))
            throw new Error(`INVALID_SFTP_INTEGRATION_CONFIG:${field}`);

    };

    return {
        host: config.host.trim(),
        port,
        username: config.username.trim(),
        hostFingerprintSha256: config.hostFingerprintSha256.trim(),
        incomingDir: config.incomingDir,
        processingDir: config.processingDir,
        processedDir: config.processedDir,
        failedDir: config.failedDir,
        outgoingDir: config.outgoingDir,
        status: config.status,
    };
};

export const getSftpIntegrationConfig = async ({ institutionId } = {}) => {
    const privateKey = process.env.SFTP_PRIVATE_KEY;
    const privateKeyPassphrase = process.env.SFTP_PRIVATE_KEY_PASSPHRASE;

    const snapshot = await getSftpIntegrationConfigRef({ institutionId }).get();

    if (!snapshot.exists)
        throw new Error("SFTP_INTEGRATION_NOT_FOUND");

    const persisted = validatePersistedConfig(snapshot.data());

    if (!privateKey)
        throw new Error("MISSING_SFTP_PRIVATE_KEY");

    if (!privateKeyPassphrase)
        throw new Error("MISSING_SFTP_PRIVATE_KEY_PASSPHRASE");

    return {
        institutionId,
        status: persisted.status,
        incomingDir: persisted.incomingDir,
        processingDir: persisted.processingDir,
        processedDir: persisted.processedDir,
        failedDir: persisted.failedDir,
        outgoingDir: persisted.outgoingDir,
        sftpConfig: {
            host: persisted.host,
            port: persisted.port,
            username: persisted.username,
            hostFingerprintSha256: persisted.hostFingerprintSha256,
            privateKey: privateKey.replace(/\\n/g, "\n"),
            passphrase: privateKeyPassphrase,
            readyTimeout: 20000,
        },
    };
};