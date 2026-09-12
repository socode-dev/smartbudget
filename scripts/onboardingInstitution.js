import { prepareInstitutionOnboarding, readInstitutionConnectionFile } from "./helpers/prepareInstitutionOnboarding.js";

const DEFAULT_CONNECTION_DETAILS_PATH = String.raw`C:\Users\stosi\.smartbudget_secrets\institutions\example.institution.json`;

const [action, ...args] = process.argv.slice(2);

try {
    let result;

    switch (action) {
        case "create": {
            if (args.length > 1)
                throw new Error("INVALID_COMMAND_ARGUMENTS");

            const input = await prepareInstitutionOnboarding(
                args[0] ?? DEFAULT_CONNECTION_DETAILS_PATH,
            );

            const { createInstitution } = await import(
                "../backend/integrations/onboarding/createInstitution.js"
            );

            result = await createInstitution(input);
            break;
        }

        case "update": {
            if (args.length < 3 || args.length > 4)
                throw new Error("INVALID_COMMAND_ARGUMENTS");

            const [
                institutionId,
                importPilotId,
                revision,
                filePath = DEFAULT_CONNECTION_DETAILS_PATH,
            ] = args;

            const { sftpConfig } =
                await readInstitutionConnectionFile(filePath);

            const { updateSftpIntegration } = await import(
                "../backend/integrations/onboarding/updateSftpIntegration.js"
            );

            result = await updateSftpIntegration({
                institutionId,
                importPilotId,
                expectedRevision: Number(revision),
                sftpConfig,
            });
            break;
        }

        case "test": {
            if (args.length !== 2)
                throw new Error("INVALID_COMMAND_ARGUMENTS");

            const { testSftpIntegration } = await import(
                "../backend/integrations/onboarding/testSftpIntegration.js"
            );

            result = await testSftpIntegration({
                institutionId: args[0],
                expectedRevision: Number(args[1]),
            });
            break;
        }

        case "enable": {
            if (args.length !== 2) {
                throw new Error("INVALID_COMMAND_ARGUMENTS");
            }

            const { enableSftpIntegration } = await import(
                "../backend/integrations/onboarding/enableSftpIntegration.js"
            );

            result = await enableSftpIntegration({
                institutionId: args[0],
                expectedRevision: Number(args[1]),
            });
            break;
        }

        default:
            throw new Error("UNKNOWN_ONBOARDING_COMMAND");
    }

    process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
    const message = error?.message ?? "";

    const safeCode = /^[A-Z][A-Z0-9_]*(?::[a-zA-Z]+)?$/.test(message)
        ? message
        : "INSTITUTION_ONBOARDING_COMMAND_FAILED";

    process.stderr.write(`${safeCode}\n`);
    process.exitCode = 1;
}
