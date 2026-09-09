import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { discoverRetryableDeliveryScopes } from "../discoverRetryableDeliveryScopes.js";
import { getSftpIntegrationConfig, getSftpIntegrationConfigRef } from "../sftpIntegrationConfig.js";
import { runAllSftpDeliveryRetries } from "../runAllSftpDeliveryRetries.js";
import { runDeliverySpoolRetry } from "../runDeliverySpoolRetry.js";

const ACTIVE_CONFIG = {
    host: "sftp.example.test",
    port: 22,
    username: "smartbudget",
    hostFingerprintSha256: "test-fingerprint",
    incomingDir: "/incoming",
    processingDir: "/processing",
    processedDir: "/processed",
    failedDir: "/failed",
    outgoingDir: "/outgoing",
    status: "ACTIVE",
};

const previousPrivateKey = process.env.SFTP_PRIVATE_KEY;
const previousPrivateKeyPassphrase =
    process.env.SFTP_PRIVATE_KEY_PASSPHRASE;

beforeEach(() => {
    process.env.SFTP_PRIVATE_KEY = "private-key";
    process.env.SFTP_PRIVATE_KEY_PASSPHRASE = "passphrase";
});

afterEach(() => {
    if (previousPrivateKey === undefined) {
        delete process.env.SFTP_PRIVATE_KEY;
    } else {
        process.env.SFTP_PRIVATE_KEY = previousPrivateKey;
    }

    if (previousPrivateKeyPassphrase === undefined) {
        delete process.env.SFTP_PRIVATE_KEY_PASSPHRASE;
    } else {
        process.env.SFTP_PRIVATE_KEY_PASSPHRASE =
            previousPrivateKeyPassphrase;
    }
});

const spoolRef = ({
    institutionId,
    pilotId,
    spoolId,
}) =>
    db
        .collection("institutions")
        .doc(institutionId)
        .collection("pilots")
        .doc(pilotId)
        .collection("deliverySpool")
        .doc(spoolId);

describe("SFTP delivery retry scheduler", () => {
    it("discovers and deduplicates retryable scopes", async () => {
        const now = Date.now();

        await Promise.all([
            spoolRef({
                institutionId: "institution-a",
                pilotId: "pilot-1",
                spoolId: "pending-1",
            }).set({
                type: "INVITATION_EXPORT",
                status: "PENDING_DELIVERY",
                institutionId: "institution-a",
                pilotId: "pilot-1",
                expiresAtMs: now + 60000,
            }),
            spoolRef({
                institutionId: "institution-a",
                pilotId: "pilot-1",
                spoolId: "failed-1",
            }).set({
                type: "INVITATION_EXPORT",
                status: "DELIVERY_FAILED",
                institutionId: "institution-a",
                pilotId: "pilot-1",
                expiresAtMs: now + 60000,
            }),
            spoolRef({
                institutionId: "institution-b",
                pilotId: "pilot-2",
                spoolId: "legacy-1",
            }).set({
                type: "INVITATION_EXPORT",
                status: "PENDING_DELIVERY",
                expiresAtMs: now + 60000,
            }),
        ]);

        const scopes =
            await discoverRetryableDeliveryScopes({ now });

        expect(scopes).toEqual([
            {
                institutionId: "institution-a",
                pilotId: "pilot-1",
            },
            {
                institutionId: "institution-b",
                pilotId: "pilot-2",
            },
        ]);
    });

    it("excludes expired and completed spools", async () => {
        const now = Date.now();

        await Promise.all([
            spoolRef({
                institutionId: "institution-a",
                pilotId: "pilot-1",
                spoolId: "expired",
            }).set({
                type: "INVITATION_EXPORT",
                status: "PENDING_DELIVERY",
                institutionId: "institution-a",
                pilotId: "pilot-1",
                expiresAtMs: now - 1,
            }),
            spoolRef({
                institutionId: "institution-b",
                pilotId: "pilot-2",
                spoolId: "completed",
            }).set({
                type: "INVITATION_EXPORT",
                status: "DELIVERED",
                institutionId: "institution-b",
                pilotId: "pilot-2",
                expiresAtMs: now + 60000,
            }),
        ]);

        const scopes =
            await discoverRetryableDeliveryScopes({ now });

        expect(scopes).toEqual([]);
    });

    it("loads institution-scoped config and injects credentials", async () => {
        const configRef = getSftpIntegrationConfigRef({ institutionId: "institution-a" });

        expect(configRef.path).toBe(
            "institutions/institution-a/integrations/sftp",
        );

        await configRef.set(ACTIVE_CONFIG);

        const result = await getSftpIntegrationConfig({ institutionId: "institution-a" });

        expect(result).not.toHaveProperty("pilotId");
        expect(result.institutionId).toBe("institution-a");
        expect(result.outgoingDir).toBe("/outgoing");
        expect(result.sftpConfig).toMatchObject({
            host: "sftp.example.test",
            port: 22,
            username: "smartbudget",
            privateKey: "private-key",
            passphrase: "passphrase",
        });

        const persisted = await configRef.get();

        expect(persisted.data()).not.toHaveProperty(
            "privateKey",
        );
        expect(persisted.data()).not.toHaveProperty(
            "passphrase",
        );
    });

    it("requires an institution id for config resolution", async () => {
        expect(() =>
            getSftpIntegrationConfigRef(),
        ).toThrow("MISSING_INSTITUTION_ID");

        await expect(
            getSftpIntegrationConfig(),
        ).rejects.toThrow("MISSING_INSTITUTION_ID");
    });

    it("uses the institution config for every pilot retry scope", async () => {
        const scopes = [
            {
                institutionId: "institution-a",
                pilotId: "pilot-1",
            },
            {
                institutionId: "institution-a",
                pilotId: "pilot-2",
            },
            {
                institutionId: "institution-b",
                pilotId: "pilot-3",
            },
        ];

        const discoverScopes = vi.fn()
            .mockResolvedValue(scopes);

        const loadIntegrationConfig = vi.fn(
            async scope => ({
                outgoingDir:
                    `/${scope.institutionId}/outgoing`,
                sftpConfig: {
                    host: `${scope.institutionId}.test`,
                },
            }),
        );

        const runScopeRetry = vi.fn()
            .mockResolvedValue({
                ok: true,
                checkedCount: 1,
                deliveredCount: 1,
                failedCount: 0,
            });

        const result = await runAllSftpDeliveryRetries({
            discoverScopes,
            loadIntegrationConfig,
            runScopeRetry,
        });

        expect(loadIntegrationConfig).toHaveBeenNthCalledWith(
            1,
            {
                institutionId: "institution-a",
            },
        );

        expect(loadIntegrationConfig).toHaveBeenNthCalledWith(
            2,
            {
                institutionId: "institution-a",
            },
        );

        expect(loadIntegrationConfig).toHaveBeenNthCalledWith(
            3,
            {
                institutionId: "institution-b",
            },
        );

        expect(runScopeRetry).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                institutionId: "institution-a",
                pilotId: "pilot-1",
                sftpConfig: {
                    host: "institution-a.test",
                },
                outgoingDir:
                    "/institution-a/outgoing",
            }),
        );

        expect(runScopeRetry).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                institutionId: "institution-a",
                pilotId: "pilot-2",
                sftpConfig: {
                    host: "institution-a.test",
                },
                outgoingDir:
                    "/institution-a/outgoing",
            }),
        );

        expect(runScopeRetry).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                institutionId: "institution-b",
                pilotId: "pilot-3",
                sftpConfig: {
                    host: "institution-b.test",
                },
                outgoingDir:
                    "/institution-b/outgoing",
            }),
        );

        expect(result).toMatchObject({
            ok: true,
            discoveredScopeCount: 3,
            successfulScopeCount: 3,
            failedScopeCount: 0,
            deliveredCount: 3,
        });
    });

    it("isolates one scope failure from another", async () => {
        const scopes = [
            {
                institutionId: "institution-a",
                pilotId: "pilot-1",
            },
            {
                institutionId: "institution-b",
                pilotId: "pilot-2",
            },
        ];

        const runScopeRetry = vi.fn()
            .mockRejectedValueOnce(
                new Error("connection details"),
            )
            .mockResolvedValueOnce({
                ok: true,
                checkedCount: 1,
                deliveredCount: 1,
                failedCount: 0,
            });

        const result = await runAllSftpDeliveryRetries({
            discoverScopes: vi.fn()
                .mockResolvedValue(scopes),
            loadIntegrationConfig: vi.fn(
                async () => ({
                    sftpConfig: { host: "test" },
                    outgoingDir: "/outgoing",
                }),
            ),
            runScopeRetry,
        });

        expect(runScopeRetry).toHaveBeenCalledTimes(2);
        expect(result).toMatchObject({
            ok: false,
            attemptedScopeCount: 2,
            successfulScopeCount: 1,
            failedScopeCount: 1,
            deliveredCount: 1,
        });
        expect(result.failureCounts).toEqual({
            SFTP_SCOPE_RETRY_FAILED: 1,
        });
    });

    it("isolates missing and disabled integrations", async () => {
        const scopes = [
            {
                institutionId: "institution-a",
                pilotId: "pilot-1",
            },
            {
                institutionId: "institution-b",
                pilotId: "pilot-2",
            },
            {
                institutionId: "institution-c",
                pilotId: "pilot-3",
            },
        ];

        const loadIntegrationConfig = vi.fn()
            .mockRejectedValueOnce(
                new Error("SFTP_INTEGRATION_NOT_FOUND"),
            )
            .mockRejectedValueOnce(
                new Error("SFTP_INTEGRATION_DISABLED"),
            )
            .mockResolvedValueOnce({
                sftpConfig: { host: "test" },
                outgoingDir: "/outgoing",
            });

        const runScopeRetry = vi.fn()
            .mockResolvedValue({
                ok: true,
                checkedCount: 1,
                deliveredCount: 1,
                failedCount: 0,
            });

        const result = await runAllSftpDeliveryRetries({
            discoverScopes: vi.fn()
                .mockResolvedValue(scopes),
            loadIntegrationConfig,
            runScopeRetry,
        });

        expect(runScopeRetry).toHaveBeenCalledTimes(1);
        expect(result.failedScopeCount).toBe(2);
        expect(result.successfulScopeCount).toBe(1);
        expect(result.failureCounts).toEqual({
            SFTP_INTEGRATION_NOT_FOUND: 1,
            SFTP_INTEGRATION_DISABLED: 1,
        });
    });

    it("succeeds when there is no retryable work", async () => {
        const result = await runAllSftpDeliveryRetries({
            discoverScopes: vi.fn()
                .mockResolvedValue([]),
            loadIntegrationConfig: vi.fn(),
            runScopeRetry: vi.fn(),
        });

        expect(result).toEqual({
            ok: true,
            discoveredScopeCount: 0,
            attemptedScopeCount: 0,
            successfulScopeCount: 0,
            failedScopeCount: 0,
            checkedDeliveryCount: 0,
            deliveredCount: 0,
            failedDeliveryCount: 0,
            failureCounts: {},
        });
    });

    it("requires injected SFTP config and directory", async () => {
        await expect(
            runDeliverySpoolRetry({
                institutionId: "institution-a",
                pilotId: "pilot-1",
                outgoingDir: "/outgoing",
            }),
        ).rejects.toThrow("MISSING_SFTP_CONFIG");

        await expect(
            runDeliverySpoolRetry({
                institutionId: "institution-a",
                pilotId: "pilot-1",
                sftpConfig: { host: "test" },
            }),
        ).rejects.toThrow(
            "MISSING_SFTP_OUTGOING_DIR",
        );
    });
});
