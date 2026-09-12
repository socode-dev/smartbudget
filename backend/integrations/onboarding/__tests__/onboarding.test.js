import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { createInstitution } from "../createInstitution.js";
import { updateSftpIntegration } from "../updateSftpIntegration.js";
import { testSftpIntegration } from "../testSftpIntegration.js";
import { enableSftpIntegration } from "../enableSftpIntegration.js";
import {
    getSftpIntegrationConfigRef,
    getSftpImportIntegrationConfig,
} from "../../sftp/sftpIntegrationConfig.js";
import { SFTP_DIRECTORY_FIELDS } from "../../sftp/sftpSettings.js";

const SETTINGS = {
    host: "sftp.example.test",
    port: 22,
    username: "smartbudget",
    hostFingerprintSha256: "a".repeat(64),
    incomingDir: "/incoming",
    processingDir: "/processing",
    processedDir: "/processed",
    failedDir: "/failed",
    outgoingDir: "/outgoing",
};

const INPUT = {
    requestId: "request-1",
    name: "Example Source",
    sftpConfig: SETTINGS,
};

const makeClient = ({ failPut = false } = {}) => {
    const files = new Map();
    const directories = new Set(
        SFTP_DIRECTORY_FIELDS.map(field => SETTINGS[field]),
    );

    const client = {
        connect: vi.fn(async config => {
            if (!config.hostVerifier(SETTINGS.hostFingerprintSha256)) {
                throw new Error("Host rejected");
            }
        }),
        end: vi.fn(async () => {}),
        exists: vi.fn(async path =>
            directories.has(path) ? "d" : files.has(path) ? "-" : false,
        ),
        list: vi.fn(async () => []),
        put: vi.fn(async (content, path) => {
            if (failPut) throw new Error("Private connection details");
            files.set(path, Buffer.from(content));
        }),
        get: vi.fn(async path => {
            if (!files.has(path)) throw new Error("Missing probe");
            return files.get(path);
        }),
        rename: vi.fn(async (from, to) => {
            if (!files.has(from)) throw new Error("Missing probe");
            files.set(to, files.get(from));
            files.delete(from);
        }),
        delete: vi.fn(async path => {
            files.delete(path);
        }),
    };

    return { client, files };
};

beforeEach(() => {
    vi.stubEnv("SFTP_PRIVATE_KEY", "test-private-key");
    vi.stubEnv("SFTP_PRIVATE_KEY_PASSPHRASE", "");
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("institution onboarding", () => {
    it("creates all four records with a disabled integration", async () => {
        const scope = await createInstitution(INPUT);
        const institutionRef = db.collection("institutions").doc(scope.institutionId);

        const [institution, pilot, integration, request] = await db.getAll(
            institutionRef,
            institutionRef.collection("pilots").doc(scope.pilotId),
            getSftpIntegrationConfigRef(scope),
            db.collection("integrationOnboardingRequests").doc(INPUT.requestId),
        );

        expect(institution.data()).toMatchObject({
            name: INPUT.name,
            status: "ACTIVE",
        });
        expect(pilot.data().status).toBe("ACTIVE");
        expect(integration.data()).toMatchObject({
            status: "DISABLED",
            revision: 1,
            importPilotId: scope.pilotId,
            verifiedRevision: null,
        });
        expect(integration.data()).not.toHaveProperty("privateKey");
        expect(integration.data()).not.toHaveProperty("passphrase");
        expect(request.data()).toMatchObject({
            ...scope,
            status: "COMPLETED",
        });
    });

    it("reuses IDs for sequential and concurrent retries", async () => {
        const results = await Promise.all([
            createInstitution(INPUT),
            createInstitution(INPUT),
        ]);

        expect(results[0]).toEqual(results[1]);
        expect(await createInstitution(INPUT)).toEqual(results[0]);
        expect((await db.collection("institutions").get()).size).toBe(1);
    });

    it("rejects reuse of a request with different settings", async () => {
        await createInstitution(INPUT);

        await expect(createInstitution({
            ...INPUT,
            sftpConfig: { ...SETTINGS, host: "different.example.test" },
        })).rejects.toThrow("ONBOARDING_REQUEST_CONFLICT");
    });

    it("rejects invalid settings before creating records", async () => {
        await expect(createInstitution({
            ...INPUT,
            sftpConfig: { ...SETTINGS, port: 0 },
        })).rejects.toThrow("INVALID_SFTP_INTEGRATION_CONFIG:port");

        expect((await db.collection("institutions").get()).empty).toBe(true);
        expect(
            (await db.collection("integrationOnboardingRequests").get()).empty,
        ).toBe(true);
    });

    it("requires successful verification before enabling", async () => {
        const scope = await createInstitution(INPUT);

        await expect(enableSftpIntegration({
            ...scope,
            expectedRevision: 1,
        })).rejects.toThrow("SFTP_CONFIGURATION_NOT_VERIFIED");

        const { client, files } = makeClient();

        await testSftpIntegration({
            ...scope,
            expectedRevision: 1,
            clientFactory: async () => client,
        });

        expect(files.size).toBe(0);
        expect(client.rename).toHaveBeenCalledTimes(4);
        expect(client.end).toHaveBeenCalledTimes(1);

        const enabled = await enableSftpIntegration({
            ...scope,
            expectedRevision: 1,
        });

        expect(enabled.status).toBe("ACTIVE");
        expect(await enableSftpIntegration({
            ...scope,
            expectedRevision: 1,
        })).toEqual(enabled);

        const config = await getSftpImportIntegrationConfig(scope);
        expect(config.pilotId).toBe(scope.pilotId);
        expect(config.sftpConfig).not.toHaveProperty("passphrase");
    });

    it("leaves failed access tests unverified", async () => {
        const scope = await createInstitution(INPUT);
        const { client } = makeClient({ failPut: true });

        await expect(testSftpIntegration({
            ...scope,
            expectedRevision: 1,
            clientFactory: async () => client,
        })).rejects.toThrow("SFTP_ACCESS_TEST_FAILED");

        const snapshot = await getSftpIntegrationConfigRef(scope).get();
        expect(snapshot.data().verifiedRevision).toBeNull();
        expect(snapshot.data().status).toBe("DISABLED");
    });

    it("does not verify when probe cleanup fails", async () => {
        const scope = await createInstitution(INPUT);
        const { client } = makeClient();

        client.delete = vi.fn(async () => {
            throw new Error("Delete denied");
        });

        await expect(testSftpIntegration({
            ...scope,
            expectedRevision: 1,
            clientFactory: async () => client,
        })).rejects.toThrow("SFTP_PROBE_CLEANUP_FAILED");

        expect(
            (await getSftpIntegrationConfigRef(scope).get())
                .data().verifiedRevision,
        ).toBeNull();
    });

    it("disables updates and rejects stale revisions", async () => {
        const scope = await createInstitution(INPUT);
        const { client } = makeClient();

        await testSftpIntegration({
            ...scope,
            expectedRevision: 1,
            clientFactory: async () => client,
        });
        await enableSftpIntegration({ ...scope, expectedRevision: 1 });

        const result = await updateSftpIntegration({
            institutionId: scope.institutionId,
            importPilotId: scope.pilotId,
            expectedRevision: 1,
            sftpConfig: { ...SETTINGS, host: "updated.example.test" },
        });

        expect(result).toMatchObject({ status: "DISABLED", revision: 2 });

        await expect(enableSftpIntegration({
            ...scope,
            expectedRevision: 2,
        })).rejects.toThrow("SFTP_CONFIGURATION_NOT_VERIFIED");

        await expect(updateSftpIntegration({
            institutionId: scope.institutionId,
            importPilotId: scope.pilotId,
            expectedRevision: 1,
            sftpConfig: SETTINGS,
        })).rejects.toThrow("SFTP_CONFIG_REVISION_CONFLICT");
    });

    it("rejects a pilot belonging to another institution", async () => {
        const first = await createInstitution(INPUT);
        const second = await createInstitution({
            ...INPUT,
            requestId: "request-2",
        });

        await expect(updateSftpIntegration({
            institutionId: first.institutionId,
            importPilotId: second.pilotId,
            expectedRevision: 1,
            sftpConfig: SETTINGS,
        })).rejects.toThrow("IMPORT_PILOT_NOT_ACTIVE");
    });

    it("rejects verification of settings changed during the test", async () => {
        const scope = await createInstitution(INPUT);
        const { client } = makeClient();
        const originalConnect = client.connect;

        client.connect = vi.fn(async config => {
            await originalConnect(config);
            await updateSftpIntegration({
                institutionId: scope.institutionId,
                importPilotId: scope.pilotId,
                expectedRevision: 1,
                sftpConfig: { ...SETTINGS, host: "updated.example.test" },
            });
        });

        await expect(testSftpIntegration({
            ...scope,
            expectedRevision: 1,
            clientFactory: async () => client,
        })).rejects.toThrow("SFTP_CONFIGURATION_CHANGED_DURING_TEST");

        const snapshot = await getSftpIntegrationConfigRef(scope).get();
        expect(snapshot.data().revision).toBe(2);
        expect(snapshot.data().verifiedRevision).toBeNull();
    });
});