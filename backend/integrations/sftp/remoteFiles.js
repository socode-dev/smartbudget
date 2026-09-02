import { isAllowedSftpCsvFile, sortSftpFilesForProcessing } from "./fileNames.js";

export const joinRemotePath = (...parts) => {
    const cleaned = parts
        .filter(Boolean)
        .map((part, index) => {
            const value = String(part).replace(/\\/g, "/");

            return index === 0
                ? value.replace(/\/+$/g, "")
                : value.replace(/^\/+/g, "").replace(/\/+$/g, "");
        });

        return cleaned.join("/") || "/";
};

export const ensureRemoteDir = async ({ client, remoteDir } = {}) => {
    if (!client) throw new Error("MISSING_SFTP_CLIENT");
    if (!remoteDir) throw new Error("MISSING_REMOTE_DIR");

    const exists = await client.exists(remoteDir);

    if (!exists) {
        await client.mkdir(remoteDir, true);
    }
};

export const listIncomingFiles = async ({
    client,
    incomingDir = "/incoming",
} = {}) => {
    if (!client) throw new Error("MISSING_SFTP_CLIENT");

    const entries = await client.list(incomingDir);

    const files = entries
        .filter(entry => entry.type === "-")
        .filter(entry => isAllowedSftpCsvFile(entry.name))
        .map(entry => ({
            name: entry.name,
            size: entry.size,
            modifyTime: entry.modifyTime,
            remotePath: joinRemotePath(incomingDir, entry.name),
        
        }));

        return sortSftpFilesForProcessing(files);
};

export const readRemoteFile = async ({ client, remotePath } = {}) => {
    if (!client) throw new Error("MISSING_SFTP_CLIENT");
    if (!remotePath) throw new Error("MISSING_REMOTE_FILE_PATH");

    const content = await client.get(remotePath);

    return Buffer.isBuffer(content) ? content.toString("utf8") : String(content);
};

export const uploadRemoteTextFile = async ({
    client,
    remotePath,
    fileContent,
} = {}) => {
    if (!client) throw new Error("MISSING_SFTP_CLIENT");
    if (!remotePath) throw new Error("MISSING_REMOTE_FILE_PATH");

    await client.put(Buffer.from(String(fileContent), "utf8"), remotePath);
};

export const moveRemoteFile = async ({
    client,
    fromPath,
    toDir,
    fileName,
} = {}) => {
    if (!client) throw new Error("MISSING_SFTP_CLIENT");
    if (!fromPath || !toDir || !fileName) {
        throw new Error("MISSING_REMOTE_MOVE_PARAMS");
    }

    await ensureRemoteDir({ client, remoteDir: toDir });

    const toPath = joinRemotePath(toDir, fileName);

    await client.rename(fromPath, toPath);

    return toPath;
};