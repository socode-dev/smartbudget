import { describe, expect, it, vi } from "vitest";
import { createSftpClient, withSftpClient } from "../client.js";
import { toSftpDiagnosticError } from "../sftpDiagnostics.js";
import { verifySftpAccess } from "../../onboarding/verifySftpAccess.js";

const config = {
    host: "private.example.test", username: "private-user", port: 22,
    privateKey: "private-key-secret", passphrase: "passphrase-secret",
    hostFingerprintSha256: "a".repeat(64),
};
const settings = Object.fromEntries([
    "incoming", "processing", "processed", "failed", "outgoing",
].map(name => [name + "Dir", "/private/" + name]));
const secretMessage = "sensitive-payload-value private.example.test /private/incoming activation-link-secret";

const makeProbeClient = () => {
    const files = new Map();
    const client = {
        exists: vi.fn(async path => Object.values(settings).includes(path)
            ? "d" : files.has(path) ? "-" : false),
        list: vi.fn(async () => []),
        put: vi.fn(async (data, path) => { files.set(path, data); }),
        get: vi.fn(async path => files.get(path)),
        rename: vi.fn(async (from, to) => {
            files.set(to, files.get(from));
            files.delete(from);
        }),
        delete: vi.fn(async path => { files.delete(path); }),
    };
    return { client, files };
};

describe("safe SFTP diagnostics", () => {
    it.each([
        ["READ_PROBE", 7, "CONNECTION_CLOSED"],
        ["SAVE_VERIFICATION", 7, "PERMISSION_DENIED"],
        ["SAVE_VERIFICATION", 4, "TIMEOUT"],
        ["RESET_VERIFICATION", 14, "BACKEND_UNAVAILABLE"],
    ])("interprets protocol error codes in the %s stage", (stage, code, reason) => {
        const error = Object.assign(new Error(secretMessage), { code });
        expect(toSftpDiagnosticError(error, { stage }).reason).toBe(reason);
    });

    it.each([
        ["ETIMEDOUT", "TIMEOUT"], ["ENOTFOUND", "DNS_LOOKUP_FAILED"],
        ["ECONNREFUSED", "CONNECTION_REFUSED"], ["ECONNRESET", "CONNECTION_CLOSED"],
    ])("reports %s without connection details", async (code, reason) => {
        const client = {
            connect: vi.fn().mockRejectedValue(Object.assign(new Error(secretMessage), { code })),
            end: vi.fn().mockResolvedValue(),
        };
        const operation = vi.fn();
        const error = await withSftpClient({ config, clientFactory: async () => client, operation })
            .catch(error => error);
        expect(error.toJSON()).toEqual({
            code: "SFTP_ACCESS_TEST_FAILED", stage: "CONNECT", reason,
            hostVerification: "NOT_REACHED",
        });
        expect(JSON.stringify(error.toJSON())).not.toContain("secret");
        expect(operation).not.toHaveBeenCalled();
        expect(client.end).toHaveBeenCalledOnce();
    });

    it("preserves rejection of an untrusted host", async () => {
        const operation = vi.fn();
        const client = {
            connect: vi.fn(async options => {
                expect(options.hostVerifier("b".repeat(64))).toBe(false);
                throw new Error(secretMessage);
            }),
            end: vi.fn().mockResolvedValue(),
        };
        await expect(withSftpClient({ config, clientFactory: async () => client, operation }))
            .rejects.toMatchObject({
                stage: "CONNECT", reason: "HOST_VERIFICATION_FAILED", hostVerification: "REJECTED",
            });
        expect(operation).not.toHaveBeenCalled();
    });

    it("distinguishes authentication failure after host verification", async () => {
        const client = {
            connect: vi.fn(async options => {
                expect(options.hostVerifier(config.hostFingerprintSha256)).toBe(true);
                throw Object.assign(new Error(secretMessage), { level: "client-authentication" });
            }),
            end: vi.fn().mockResolvedValue(),
        };
        await expect(withSftpClient({ config, clientFactory: async () => client, operation: vi.fn() }))
            .rejects.toMatchObject({
                stage: "CONNECT", reason: "AUTHENTICATION_FAILED", hostVerification: "MATCHED",
            });
    });

    it("reports client creation separately", async () => {
        await expect(withSftpClient({ config, operation: vi.fn(), clientFactory: async () => {
            throw new Error("SFTP_CLIENT_DEPENDENCY_MISSING");
        } })).rejects.toMatchObject({ stage: "CREATE_CLIENT" });
    });

    it("redacts key parsing errors", () => {
        const error = new Error("Cannot parse privateKey: " + config.privateKey + " " + config.passphrase);
        const diagnostic = toSftpDiagnosticError(error, { stage: "CONNECT" });
        expect(diagnostic.reason).toBe("PRIVATE_KEY_INVALID");
        expect(JSON.stringify(diagnostic)).not.toContain(config.privateKey);
        expect(JSON.stringify(diagnostic)).not.toContain(config.passphrase);
    });

    it("redacts library global error events", async () => {
        const log = vi.spyOn(console, "error").mockImplementation(() => {});
        const client = await createSftpClient();
        client.eventCallbacks.error(new Error(secretMessage));
        expect(log).toHaveBeenCalledWith(JSON.stringify({
            code: "SFTP_ACCESS_TEST_FAILED", stage: "CLIENT_EVENT", reason: "UNKNOWN",
        }));
    });

    it.each([
        ["exists", "CHECK_DIRECTORY"], ["list", "LIST_DIRECTORY"],
        ["put", "WRITE_PROBE"], ["get", "READ_PROBE"],
        ["rename", "RENAME_PROBE"], ["delete", "DELETE_PROBE"],
    ])("identifies a failing %s operation without paths or payloads", async (method, stage) => {
        const { client, files } = makeProbeClient();
        client[method].mockRejectedValueOnce(Object.assign(new Error(secretMessage), { code: 3 }));
        const error = await verifySftpAccess({ client, settings }).catch(error => error);
        expect(error).toMatchObject({ stage, reason: "PERMISSION_DENIED" });
        expect(error.target).toBeTruthy();
        expect(JSON.stringify(error.toJSON())).not.toMatch(/private|secret/);
        expect(files.size).toBe(0);
    });

    it("reports missing directories and content mismatches", async () => {
        const { client } = makeProbeClient();
        client.exists.mockResolvedValueOnce(false);
        await expect(verifySftpAccess({ client, settings })).rejects.toMatchObject({
            stage: "CHECK_DIRECTORY", target: "incomingDir", reason: "SFTP_DIRECTORY_UNAVAILABLE",
        });
        client.get.mockResolvedValueOnce(Buffer.from("wrong content"));
        await expect(verifySftpAccess({ client, settings })).rejects.toMatchObject({
            stage: "READ_PROBE", reason: "SFTP_PROBE_CONTENT_MISMATCH",
        });
    });

    it("keeps both the primary failure and cleanup failure", async () => {
        const { client } = makeProbeClient();
        client.get.mockRejectedValueOnce(new Error(secretMessage));
        client.delete.mockRejectedValue(Object.assign(new Error(secretMessage), { code: 3 }));
        const error = await verifySftpAccess({ client, settings }).catch(error => error);
        expect(error.toJSON()).toMatchObject({
            stage: "READ_PROBE",
            cleanupFailure: { stage: "CLEANUP_PROBE", reason: "PERMISSION_DENIED" },
        });
        expect(JSON.stringify(error.toJSON())).not.toMatch(/private|secret/);
    });

    it("still completes all probe lifecycles and removes probes", async () => {
        const { client, files } = makeProbeClient();
        await verifySftpAccess({ client, settings });
        expect(client.rename).toHaveBeenCalledTimes(4);
        expect(client.put).toHaveBeenCalledTimes(3);
        expect(files.size).toBe(0);
    });

    it("does not serialize raw errors, codes, or stack traces", () => {
        const raw = Object.assign(new Error(secretMessage), { code: secretMessage });
        const diagnostic = toSftpDiagnosticError(raw, { stage: "SAVE_VERIFICATION" });
        expect(JSON.stringify(diagnostic)).toBe(JSON.stringify({
            code: "SFTP_ACCESS_TEST_FAILED", stage: "SAVE_VERIFICATION", reason: "UNKNOWN",
        }));
        expect(diagnostic.cause).toBeUndefined();
    });
});
