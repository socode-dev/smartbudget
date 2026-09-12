import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import { SFTP_DIRECTORY_FIELDS } from "../sftp/sftpSettings.js";

export const verifySftpAccess = async ({ client, settings }) => {
    const cleanupPaths = new Set();
    const payload = Buffer.from("SmartBudget SFTP verification\n", "utf8");

    let operationFailed = false;
    let cleanupFailed = false;

    const checkContent = async path => {
        const content = await client.get(path);

        if (!Buffer.isBuffer(content) || !content.equals(payload))
            throw new Error("SFTP_PROBE_CONTENT_MISMATCH");
    };

    try {
        for (const field of SFTP_DIRECTORY_FIELDS) {
            const directory = settings[field];

            if (await client.exists(directory) !== "d")
                throw new Error("SFTP_DIRECTORY_UNAVAILABLE");

            await client.list(directory);
        }

        for (const destination of [
            settings.processedDir,
            settings.failedDir,
        ]) {
            const name = `smartbudget-probe-${randomUUID()}.txt`;
            const incoming = posix.join(settings.incomingDir, name);
            const processing = posix.join(settings.processingDir, name);
            const finalPath = posix.join(destination, name);

            cleanupPaths.add(incoming);
            cleanupPaths.add(processing);
            cleanupPaths.add(finalPath);

            await client.put(payload, incoming);
            await checkContent(incoming);
            await client.rename(incoming, processing);
            await client.rename(processing, finalPath);
            await checkContent(finalPath);
            await client.delete(finalPath);
        }

        const outgoing = posix.join(
            settings.outgoingDir,
            `smartbudget-probe-${randomUUID()}.txt`,
        );

        cleanupPaths.add(outgoing);

        await client.put(payload, outgoing);
        await checkContent(outgoing);
        await client.delete(outgoing);
    } catch {
        operationFailed = true;
    } finally {
        for (const path of cleanupPaths) {
            try {
                if (await client.exists(path)) {
                    await client.delete(path);
                }
            } catch {
                cleanupFailed = true;
            }
        }
    }

    if (cleanupFailed)
        throw new Error("SFTP_PROBE_CLEANUP_FAILED");

    if (operationFailed)
        throw new Error("SFTP_ACCESS_TEST_FAILED");
};