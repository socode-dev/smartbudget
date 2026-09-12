import { randomUUID } from "node:crypto";
import { open, readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateConnectionDetails } from "../../backend/integrations/sftp/sftpSettings.js";

const resolveExternalFile = async filePath => {
    if (!filePath)
        throw new Error("CONNECTION_DETAILS_FILE_REQUIRED");

    const repositoryRoot = await realpath(
        fileURLToPath(new URL("../../", import.meta.url)),
    );
    const externalPath = await realpath(resolve(filePath));

    const comparable = value =>
        process.platform === "win32" ? value.toLowerCase() : value;

    const relativePath = relative(
        comparable(repositoryRoot),
        comparable(externalPath),
    );

    const isOutside =
        isAbsolute(relativePath) ||
        relativePath === ".." ||
        relativePath.startsWith(`..${sep}`);

    if (!isOutside)
        throw new Error("CONNECTION_DETAILS_MUST_BE_OUTSIDE_REPOSITORY");

    return externalPath;
};

const readJson = async (path, errorCode) => {
    try {
        const content = await readFile(path, "utf8");
        return JSON.parse(content.replace(/^\uFEFF/, ""));
    } catch {
        throw new Error(errorCode);
    }
};

export const readInstitutionConnectionFile = async filePath => {
    const externalPath = await resolveExternalFile(filePath);
    const input = await readJson(
        externalPath,
        "INVALID_CONNECTION_DETAILS_JSON",
    );

    return {
        externalPath,
        ...validateConnectionDetails(input),
    };
};

const getOrCreateRequestId = async path => {
    const requestId = randomUUID();
    let handle;

    try {
        handle = await open(path, "wx", 0o600);
    } catch (error) {
        if (error.code !== "EEXIST")
            throw new Error("ONBOARDING_REQUEST_STATE_WRITE_FAILED");

        const previous = await readJson(
            path,
            "INVALID_ONBOARDING_REQUEST_STATE_FILE",
        );

        if (
            !previous ||
            typeof previous !== "object" ||
            Array.isArray(previous) ||
            Object.keys(previous).length !== 1 ||
            typeof previous.requestId !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                previous.requestId,
            )
        )
            throw new Error("INVALID_ONBOARDING_REQUEST_STATE_FILE");

        return previous.requestId;
    }

    try {
        await handle.writeFile(
            `${JSON.stringify({ requestId }, null, 2)}\n`,
            "utf8",
        );
        await handle.sync();
    } catch {
        throw new Error("ONBOARDING_REQUEST_STATE_WRITE_FAILED");
    } finally {
        await handle.close();
    }

    return requestId;
};

export const prepareInstitutionOnboarding = async filePath => {
    const { externalPath, name, sftpConfig } =
        await readInstitutionConnectionFile(filePath);

    const requestId = await getOrCreateRequestId(
        `${externalPath}.onboarding-request.json`,
    );

    return {
        requestId,
        name,
        sftpConfig,
    };
};