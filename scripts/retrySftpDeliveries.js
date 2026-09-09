import { runAllSftpDeliveryRetries } from "../backend/integrations/sftp/runAllSftpDeliveryRetries.js";

try {
    const result = await runAllSftpDeliveryRetries();

    process.stdout.write(`${JSON.stringify(result)}\n`);

    if (!result.ok) process.exitCode = 1;
} catch {
    process.stderr.write("SFTP delivery retry scheduler failed\n");
    process.exitCode = 1;
}