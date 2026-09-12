import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
    prepareInstitutionOnboarding,
} from "../prepareInstitutionOnboarding.js";

let directory;

const INPUT = {
    institutionName: "Example Source",
    sftp: {
        host: "sftp.example.test",
        port: 22,
        username: "smartbudget",
        hostFingerprintSha256: `SHA256:${Buffer.alloc(32, 1)
            .toString("base64")
            .replace(/=+$/, "")}`,
        incomingDir: "/incoming",
        processingDir: "/processing",
        processedDir: "/processed",
        failedDir: "/failed",
        outgoingDir: "/outgoing",
    },
};

beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "smartbudget-onboarding-"));
});

afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
});

describe("external onboarding input", () => {
    it("normalizes the fingerprint and preserves the generated request ID", async () => {
        const filePath = join(directory, "connection.json");
        await writeFile(filePath, JSON.stringify(INPUT));

        const first = await prepareInstitutionOnboarding(filePath);
        const second = await prepareInstitutionOnboarding(filePath);

        expect(second.requestId).toBe(first.requestId);
        expect(first.name).toBe(INPUT.institutionName);
        expect(first.sftpConfig.hostFingerprintSha256).toBe("01".repeat(32));

        const state = JSON.parse(await readFile(
            `${filePath}.onboarding-request.json`,
            "utf8",
        ));

        expect(state).toEqual({ requestId: first.requestId });
    });

    it("does not create request state for invalid input", async () => {
        const filePath = join(directory, "invalid.json");

        await writeFile(filePath, JSON.stringify({
            ...INPUT,
            sftp: { ...INPUT.sftp, privateKey: "must-not-be-accepted" },
        }));

        await expect(
            prepareInstitutionOnboarding(filePath),
        ).rejects.toThrow("INVALID_SFTP_DETAILS_STRUCTURE");

        await expect(
            readFile(`${filePath}.onboarding-request.json`, "utf8"),
        ).rejects.toMatchObject({ code: "ENOENT" });
    });

    it("rejects malformed JSON", async () => {
        const filePath = join(directory, "invalid.json");
        await writeFile(filePath, "{");

        await expect(
            prepareInstitutionOnboarding(filePath),
        ).rejects.toThrow("INVALID_CONNECTION_DETAILS_JSON");
    });

    it("rejects repository files", async () => {
        const filePath = fileURLToPath(
            new URL("../../../package.json", import.meta.url),
        );

        await expect(
            prepareInstitutionOnboarding(filePath),
        ).rejects.toThrow("CONNECTION_DETAILS_MUST_BE_OUTSIDE_REPOSITORY");
    });

    it("does not silently replace corrupt request state", async () => {
        const filePath = join(directory, "connection.json");
        await writeFile(filePath, JSON.stringify(INPUT));
        await writeFile(`${filePath}.onboarding-request.json`, "{");

        await expect(
            prepareInstitutionOnboarding(filePath),
        ).rejects.toThrow("INVALID_ONBOARDING_REQUEST_STATE_FILE");
    });
});