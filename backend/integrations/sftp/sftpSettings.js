import { posix } from "node:path";

export const SFTP_INTEGRATION_STATUSES = Object.freeze({
    ACTIVE: "ACTIVE",
    DISABLED: "DISABLED",
});

export const SFTP_DIRECTORY_FIELDS = Object.freeze([
    "incomingDir",
    "processingDir",
    "processedDir",
    "failedDir",
    "outgoingDir",
]);

const SFTP_FIELDS = [
    "host",
    "port",
    "username",
    "hostFingerprintSha256",
    ...SFTP_DIRECTORY_FIELDS,
];

export const assertDocumentId = (value, errorCode) => {
    if (
        typeof value !== "string" ||
        !value ||
        value !== value.trim() ||
        value.includes("/") ||
        value.includes("\0") ||
        value === "." ||
        value === ".." ||
        /^__.*__$/.test(value) ||
        Buffer.byteLength(value, "utf8") > 1500
    ) {
        throw new Error(errorCode);
    }

    return value;
};

export const assertConfigRevision = revision => {
    if (!Number.isSafeInteger(revision) || revision < 1) {
        throw new Error("INVALID_SFTP_CONFIG_REVISION");
    }

    return revision;
};

const assertExactFields = (value, fields, errorCode) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error(errorCode);

    if (Object.keys(value).length !== fields.length || fields.some(field => !Object.hasOwn(value, field)))
        throw new Error(errorCode);
};

export const normalizeHostFingerprint = value => {
    if (typeof value !== "string")
        throw new Error("INVALID_SFTP_HOST_FINGERPRINT");

    const fingerprint = value.trim();

    if (/^[0-9a-f]{64}$/i.test(fingerprint))
        return fingerprint.toLowerCase();

    const match = /^SHA256:([A-Za-z0-9+/]{43}=?)$/.exec(fingerprint);

    if (!match)
        throw new Error("INVALID_SFTP_HOST_FINGERPRINT");

    const encoded = match[1].replace(/=+$/, "");
    const digest = Buffer.from(encoded, "base64");

    if (
        digest.length !== 32 ||
        digest.toString("base64").replace(/=+$/, "") !== encoded
    )
        throw new Error("INVALID_SFTP_HOST_FINGERPRINT");

    return digest.toString("hex");
};

export const validateSftpSettings = (input = {}) => {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new Error("INVALID_SFTP_INTEGRATION_CONFIG");
    }

    const settings = {};

    for (const field of ["host", "username"]) {
        if (
            typeof input[field] !== "string" ||
            !input[field].trim() ||
            /[\u0000-\u001f\u007f]/.test(input[field])
        )
            throw new Error(`INVALID_SFTP_INTEGRATION_CONFIG:${field}`);

        settings[field] = input[field].trim();
    }

    if (!Number.isInteger(input.port) || input.port < 1 || input.port > 65535)
        throw new Error("INVALID_SFTP_INTEGRATION_CONFIG:port");

    settings.port = input.port;
    settings.hostFingerprintSha256 = normalizeHostFingerprint(input.hostFingerprintSha256);

    for (const field of SFTP_DIRECTORY_FIELDS) {
        const value = input[field];

        if (
            typeof value !== "string" ||
            !value.startsWith("/") ||
            value.includes("\\") ||
            value.split("/").includes("..") ||
            /[\u0000-\u001f\u007f]/.test(value)
        )
            throw new Error(`INVALID_SFTP_INTEGRATION_CONFIG:${field}`);

        settings[field] =
            posix.normalize(value).replace(/\/+$/, "") || "/";
    }

    const directories = SFTP_DIRECTORY_FIELDS.map(field => settings[field]);

    if (new Set(directories).size !== directories.length)
        throw new Error("INVALID_SFTP_INTEGRATION_CONFIG:directories");

    return settings;
};

export const validateConnectionDetails = input => {
    assertExactFields(
        input,
        ["institutionName", "sftp"],
        "INVALID_CONNECTION_DETAILS_STRUCTURE",
    );

    if (
        typeof input.institutionName !== "string" ||
        !input.institutionName.trim()
    )
        throw new Error("INVALID_INSTITUTION_NAME");

    assertExactFields(
        input.sftp,
        SFTP_FIELDS,
        "INVALID_SFTP_DETAILS_STRUCTURE",
    );

    return {
        name: input.institutionName.trim(),
        sftpConfig: validateSftpSettings(input.sftp),
    };
};