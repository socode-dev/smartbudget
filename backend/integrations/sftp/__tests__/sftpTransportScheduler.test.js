import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { discoverActiveSftpIntegrations } from "../discoverActiveSftpIntegrations.js";
import { runAllSftpTransports } from "../runAllSftpTransports.js";

const SCOPES = [
    { institutionId: "source-a" },
    { institutionId: "source-b" },
];

const makeIntegration = institutionId => ({
    pilotId: `${institutionId}-pilot`,
    sftpConfig: { host: `${institutionId}.example.test` },
    incomingDir: `/${institutionId}/incoming`,
    processingDir: `/${institutionId}/processing`,
    processedDir: `/${institutionId}/processed`,
    failedDir: `/${institutionId}/failed`,
    outgoingDir: `/${institutionId}/outgoing`,
});

beforeEach(() => {
    vi.stubEnv("SFTP_IMPORT_HMAC_SECRET", "test-hmac-secret");
    vi.stubEnv(
        "SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY",
        Buffer.alloc(32, 1).toString("base64"),
    );
    vi.stubEnv("SMARTBUDGET_ACTIVATION_BASE_URL", "https://example.test");
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("global SFTP transport scheduler", () => {
    it("discovers only active institution-level SFTP integrations", async () => {
        const entries = [
            ["institutions/source-b/integrations/sftp", "ACTIVE"],
            ["institutions/source-a/integrations/sftp", "ACTIVE"],
            ["institutions/source-c/integrations/sftp", "DISABLED"],
            ["institutions/source-a/integrations/other", "ACTIVE"],
            ["other/source-d/integrations/sftp", "ACTIVE"],
            ["institutions/source-a/pilots/p1/integrations/sftp", "ACTIVE"],
        ];

        for (const [path, status] of entries) {
            await db.doc(path).set({ status });
        }

        expect(await discoverActiveSftpIntegrations()).toEqual(SCOPES);
    });

    it("loads each institution's settings and passes its pilot to the worker", async () => {
        const loadIntegrationConfig = vi.fn(async ({ institutionId }) =>
            makeIntegration(institutionId),
        );

        const runTransport = vi.fn(async () => ({
            ok: true,
            fileCount: 2,
            processedCount: 2,
            failedCount: 0,
            results: [{ privatePayload: "must-not-escape" }],
        }));

        const result = await runAllSftpTransports({
            discoverIntegrations: async () => SCOPES,
            loadIntegrationConfig,
            runTransport,
        });

        for (let index = 0; index < SCOPES.length; index += 1) {
            const { institutionId } = SCOPES[index];

            expect(loadIntegrationConfig).toHaveBeenNthCalledWith(
                index + 1,
                { institutionId },
            );

            expect(runTransport).toHaveBeenNthCalledWith(
                index + 1,
                expect.objectContaining({
                    institutionId,
                    ...makeIntegration(institutionId),
                }),
            );
        }

        expect(result).toMatchObject({
            ok: true,
            successfulInstitutionCount: 2,
            discoveredFileCount: 4,
            processedFileCount: 4,
        });
        expect(JSON.stringify(result)).not.toContain("must-not-escape");
    });

    it("continues after a transport failure and excludes raw errors", async () => {
        const result = await runAllSftpTransports({
            discoverIntegrations: async () => SCOPES,
            loadIntegrationConfig: async ({ institutionId }) =>
                makeIntegration(institutionId),
            runTransport: vi.fn()
                .mockRejectedValueOnce(new Error("sensitive connection detail"))
                .mockResolvedValueOnce({
                    ok: true,
                    fileCount: 1,
                    processedCount: 1,
                    failedCount: 0,
                }),
        });

        expect(result).toMatchObject({
            ok: false,
            failedInstitutionCount: 1,
            successfulInstitutionCount: 1,
            processedFileCount: 1,
        });
        expect(result.failureCounts).toEqual({
            SFTP_TRANSPORT_SCOPE_FAILED: 1,
        });
        expect(JSON.stringify(result)).not.toContain("sensitive");
    });

    it.each([
        "SFTP_INTEGRATION_NOT_FOUND",
        "SFTP_INTEGRATION_DISABLED",
        "MISSING_SFTP_IMPORT_PILOT_ID",
        "SFTP_CONFIGURATION_NOT_VERIFIED",
    ])("isolates configuration failure: %s", async errorCode => {
        const runTransport = vi.fn(async () => ({
            ok: true,
            fileCount: 0,
            processedCount: 0,
            failedCount: 0,
        }));

        const result = await runAllSftpTransports({
            discoverIntegrations: async () => SCOPES,
            loadIntegrationConfig: vi.fn()
                .mockRejectedValueOnce(new Error(errorCode))
                .mockResolvedValueOnce(makeIntegration("source-b")),
            runTransport,
        });

        expect(runTransport).toHaveBeenCalledTimes(1);
        expect(result.failedInstitutionCount).toBe(1);
        expect(result.successfulInstitutionCount).toBe(1);
        expect(result.failureCounts).toEqual({ [errorCode]: 1 });
    });

    it("records unsuccessful file results", async () => {
        const result = await runAllSftpTransports({
            discoverIntegrations: async () => [SCOPES[0]],
            loadIntegrationConfig: async () => makeIntegration("source-a"),
            runTransport: async () => ({
                ok: false,
                fileCount: 2,
                processedCount: 1,
                failedCount: 1,
            }),
        });

        expect(result.failedFileCount).toBe(1);
        expect(result.failureCounts).toEqual({
            SFTP_IMPORT_FILES_FAILED: 1,
        });
    });

    it("succeeds with no active integrations", async () => {
        vi.stubEnv("SFTP_IMPORT_HMAC_SECRET", "");

        const loadIntegrationConfig = vi.fn();
        const runTransport = vi.fn();

        const result = await runAllSftpTransports({
            discoverIntegrations: async () => [],
            loadIntegrationConfig,
            runTransport,
        });

        expect(result.ok).toBe(true);
        expect(result.attemptedInstitutionCount).toBe(0);
        expect(loadIntegrationConfig).not.toHaveBeenCalled();
        expect(runTransport).not.toHaveBeenCalled();
    });

    it("fails before transport when shared settings are missing", async () => {
        vi.stubEnv("SFTP_IMPORT_HMAC_SECRET", "");

        const runTransport = vi.fn();

        await expect(runAllSftpTransports({
            discoverIntegrations: async () => SCOPES,
            loadIntegrationConfig: async () => makeIntegration("source-a"),
            runTransport,
        })).rejects.toThrow("MISSING_SFTP_IMPORT_HMAC_SECRET");

        expect(runTransport).not.toHaveBeenCalled();
    });
});