import { runSftpDiagnosticStep, toSftpDiagnosticError } from "./sftpDiagnostics.js";

const REQUIRED_CONFIG_FIELDS = ["host", "username", "hostFingerprintSha256"];

const assertValidSftpConfig = (config = {}) => {
    const missing = REQUIRED_CONFIG_FIELDS.filter(field => !config[field]);


    if (missing.length)
        throw new Error(`MISSING_SFTP_CONFIG:${missing.join(", ")}`);

    if (!config.privateKey)
        throw new Error("MISSING_SFTP_PRIVATE_KEY");
};

export const createSftpConfigFromEnv = ({ prefix = "SFTP" } = {}) => {
    const passphrase = process.env[`${prefix}_PRIVATE_KEY_PASSPHRASE`];

    return {
        host: process.env[`${prefix}_HOST`],
        port: Number(process.env[`${prefix}_PORT`] || 22),
        username: process.env[`${prefix}_USERNAME`],
        privateKey: process.env[`${prefix}_PRIVATE_KEY`]?.replace(/\\n/g, "\n"),
        hostFingerprintSha256: process.env[`${prefix}_HOST_FINGERPRINT_SHA256`],
        readyTimeout: Number(process.env[`${prefix}_READY_TIMEOUT_MS`] || 20000),
        ...(passphrase ? { passphrase } : {}),
    };
};

export const createSftpClient = async () => {
    try {
        const { default: SftpClient } = await import("ssh2-sftp-client");
        return new SftpClient("smartbudget", {
            error: error => console.error(JSON.stringify(
                toSftpDiagnosticError(error, { stage: "CLIENT_EVENT" }).toJSON(),
            )),
            end: () => {},
            close: () => {},
        });
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

    const client = await runSftpDiagnosticStep({ stage: "CREATE_CLIENT" }, clientFactory);
    let hostVerification = "NOT_REACHED";

    try {
        try {
            await client.connect({
                host: config.host,
                port: config.port || 22,
                username: config.username,
                privateKey: config.privateKey,
                readyTimeout: config.readyTimeout,
                hostHash: "sha256",
                hostVerifier: hashedKey => {
                    const matches = hashedKey === config.hostFingerprintSha256;
                    hostVerification = matches ? "MATCHED" : "REJECTED";
                    return matches;
                },
                ...(config.passphrase ? { passphrase: config.passphrase } : {}),
            });
        } catch (error) {
            throw toSftpDiagnosticError(error, {
                stage: "CONNECT",
                hostVerification,
                ...(hostVerification === "REJECTED"
                    ? { reason: "HOST_VERIFICATION_FAILED" } : {}),
            });
        }

        return await operation(client);
    } finally {
        await client.end().catch(() => {});
    }
}
