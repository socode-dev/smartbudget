const SAFE_CODES = new Set([
    "MISSING_SFTP_PRIVATE_KEY",
    "SFTP_CLIENT_DEPENDENCY_MISSING",
    "SFTP_INTEGRATION_NOT_FOUND",
    "SFTP_TEST_REQUIRES_DISABLED_INTEGRATION",
    "SFTP_CONFIG_REVISION_CONFLICT",
    "SFTP_CONFIGURATION_CHANGED_DURING_TEST",
    "SFTP_DIRECTORY_UNAVAILABLE",
    "SFTP_PROBE_CONTENT_MISMATCH",
]);

const getReason = (error, stage) => {
    const code = error?.code;
    const message = String(error?.message ?? "");
    const backendStage = ["PREPARE_VERIFICATION", "SAVE_VERIFICATION", "RESET_VERIFICATION"].includes(stage);

    if (backendStage) {
        if (code === 4 || code === "deadline-exceeded") return "TIMEOUT";
        if (code === 7 || code === "permission-denied") return "PERMISSION_DENIED";
        if (code === 14 || code === "unavailable") return "BACKEND_UNAVAILABLE";
    } else {
        if (code === 2) return "NOT_FOUND";
        if (code === 3) return "PERMISSION_DENIED";
        if (code === 6 || code === 7) return "CONNECTION_CLOSED";
        if (code === 8) return "OPERATION_UNSUPPORTED";
    }

    if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "DNS_LOOKUP_FAILED";
    if (code === "ECONNREFUSED") return "CONNECTION_REFUSED";
    if (code === "ETIMEDOUT" ||
        /timed out|timeout/i.test(message)) return "TIMEOUT";
    if (code === "ECONNRESET" || code === "EPIPE" ||
        /connection lost|connection closed|socket closed|unexpected.*end/i.test(message))
        return "CONNECTION_CLOSED";
    if (error?.level === "client-authentication" ||
        /authentication|all configured authentication methods failed/i.test(message))
        return "AUTHENTICATION_FAILED";
    if (/host.*verif|fingerprint/i.test(message)) return "HOST_VERIFICATION_FAILED";
    if (/private.*key|passphrase|decrypt|key.*parse|unsupported key/i.test(message))
        return "PRIVATE_KEY_INVALID";
    if (/no matching|handshake failed|key exchange failed/i.test(message))
        return "HANDSHAKE_NEGOTIATION_FAILED";
    if (code === "EACCES" || code === "EPERM" ||
        /permission denied|permission-denied/i.test(message)) return "PERMISSION_DENIED";
    if (code === "ENOENT" || /no such file/i.test(message))
        return "NOT_FOUND";
    if (SAFE_CODES.has(message)) return message;
    return "UNKNOWN";
};

export class SftpDiagnosticError extends Error {
    constructor({ stage, reason, target, hostVerification, code = "SFTP_ACCESS_TEST_FAILED" }) {
        super(code);
        this.name = "SftpDiagnosticError";
        this.stage = stage;
        this.reason = reason;
        this.target = target;
        this.hostVerification = hostVerification;
    }

    toJSON() {
        return {
            code: this.message,
            stage: this.stage,
            reason: this.reason,
            ...(this.target ? { target: this.target } : {}),
            ...(this.hostVerification ? { hostVerification: this.hostVerification } : {}),
            ...(this.cleanupFailure ? { cleanupFailure: this.cleanupFailure.toJSON() } : {}),
            ...(this.resetFailure ? { resetFailure: this.resetFailure.toJSON() } : {}),
        };
    }
}

export const toSftpDiagnosticError = (error, details) => {
    if (error instanceof SftpDiagnosticError) return error;
    return new SftpDiagnosticError({
        code: SAFE_CODES.has(error?.message) ? error.message : "SFTP_ACCESS_TEST_FAILED",
        reason: getReason(error, details.stage),
        ...details,
    });
};

export const runSftpDiagnosticStep = async (details, operation) => {
    try {
        return await operation();
    } catch (error) {
        throw toSftpDiagnosticError(error, details);
    }
};
