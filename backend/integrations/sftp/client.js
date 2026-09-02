const REQUIRED_CONFIG_FIELDS = ["host", "username", "hostFingerprintSha256"];

const assertValidSftpConfig = (config = {}) => {
    const missing = REQUIRED_CONFIG_FIELDS.filter(field => !config[field]);


    if (missing.length)
        throw new Error(`MISSING_SFTP_CONFIG:${missing.join(", ")}`);

    if (!config.privateKey)
        throw new Error("MISSING_SFTP_PRIVATE_KEY");
};

export const createSftpConfigFromEnv = ({ prefix = "SFTP" } = {}) => ({
    host: process.env[`${prefix}_HOST`],
    port: Number(process.env[`${prefix}_PORT`] || 22),
    username: process.env[`${prefix}_USERNAME`],
    privateKey: process.env[`${prefix}_PRIVATE_KEY`]?.replace(/\\n/g, "\n"),
    passphrase: process.env[`${prefix}_PRIVATE_KEY_PASSPHRASE`],
    hostFingerprintSha256: process.env[`${prefix}_HOST_FINGERPRINT_SHA256`],
    readyTimeout: Number(process.env[`${prefix}_READY_TIMEOUT_MS`] || 20000),
});

export const createSftpClient = async () => {
    try {
        const { default: SftpClient } = await import("ssh2-sftp-client");
        return new SftpClient();
    } catch {
        throw new Error("SFTP_CLIENT_DEPENDENCY_MISSING");
    }
};

export const withSftpClient = async ({
    config,
    clientFactory = createSftpClient,
    operation,
} = {}) => {
    if (typeof operation !== "function")
        throw new Error("MISSING_SFTP_OPERATION");

    assertValidSftpConfig(config);

    const client = await clientFactory();

    try {
        await client.connect({
            host: config.host,
            port: config.port || 22,
            username: config.username,
            privateKey: config.privateKey,
            passphrase: config.passphrase,
            readyTimeout: config.readyTimeout,
            hostHash: "sha256",
            hostVerifier: (hashedKey) => hashedKey === config.hostFingerprintSha256,
        });

        return await operation(client);
    } finally {
        await client.end().catch(() => {});
    }
}