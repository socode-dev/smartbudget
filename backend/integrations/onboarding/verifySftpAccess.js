import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import { SFTP_DIRECTORY_FIELDS } from "../sftp/sftpSettings.js";
import { runSftpDiagnosticStep, toSftpDiagnosticError } from "../sftp/sftpDiagnostics.js";

export const verifySftpAccess = async ({ client, settings }) => {
    const cleanupPaths = new Map();
    const payload = Buffer.from("SmartBudget SFTP verification\n", "utf8");

    let operationError;
    let cleanupError;

    const step = (stage, target, operation) =>
        runSftpDiagnosticStep({ stage, target }, operation);

    const checkContent = (path, target) => step("READ_PROBE", target, async () => {
        const content = await client.get(path);

        if (!Buffer.isBuffer(content) || !content.equals(payload))
            throw new Error("SFTP_PROBE_CONTENT_MISMATCH");
    });

    try {
        for (const field of SFTP_DIRECTORY_FIELDS) {
            const directory = settings[field];

            await step("CHECK_DIRECTORY", field, async () => {
                if (await client.exists(directory) !== "d")
                    throw new Error("SFTP_DIRECTORY_UNAVAILABLE");
            });

            await step("LIST_DIRECTORY", field, () => client.list(directory));
        }

        for (const destinationField of ["processedDir", "failedDir"]) {
            const destination = settings[destinationField];
            const name = `smartbudget-probe-${randomUUID()}.txt`;
            const incoming = posix.join(settings.incomingDir, name);
            const processing = posix.join(settings.processingDir, name);
            const finalPath = posix.join(destination, name);

            cleanupPaths.set(incoming, "incomingDir");
            cleanupPaths.set(processing, "processingDir");
            cleanupPaths.set(finalPath, destinationField);

            await step("WRITE_PROBE", "incomingDir", () => client.put(payload, incoming));
            await checkContent(incoming, "incomingDir");
            await step("RENAME_PROBE", "incomingDir->processingDir", () =>
                client.rename(incoming, processing));
            await step("RENAME_PROBE", `processingDir->${destinationField}`, () =>
                client.rename(processing, finalPath));
            await checkContent(finalPath, destinationField);
            await step("DELETE_PROBE", destinationField, () => client.delete(finalPath));
        }

        const outgoing = posix.join(
            settings.outgoingDir,
            `smartbudget-probe-${randomUUID()}.txt`,
        );

        cleanupPaths.set(outgoing, "outgoingDir");

        await step("WRITE_PROBE", "outgoingDir", () => client.put(payload, outgoing));
        await checkContent(outgoing, "outgoingDir");
        await step("DELETE_PROBE", "outgoingDir", () => client.delete(outgoing));
    } catch (error) {
        operationError = toSftpDiagnosticError(error, { stage: "PROBE" });
    } finally {
        for (const [path, target] of cleanupPaths) {
            try {
                if (await client.exists(path)) {
                    await client.delete(path);
                }
            } catch (error) {
                cleanupError ??= toSftpDiagnosticError(error, {
                    stage: "CLEANUP_PROBE", target, code: "SFTP_PROBE_CLEANUP_FAILED",
                });
            }
        }
    }

    if (operationError) {
        if (cleanupError) operationError.cleanupFailure = cleanupError;
        throw operationError;
    }
    if (cleanupError) throw cleanupError;
};
