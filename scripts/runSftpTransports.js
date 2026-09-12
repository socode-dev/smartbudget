try {
    const { runAllSftpTransports } = await import(
        "../backend/integrations/sftp/runAllSftpTransports.js"
    );

    const result = await runAllSftpTransports();

    process.stdout.write(`${JSON.stringify(result)}\n`);

    if (!result.ok) process.exitCode = 1;
} catch {
    process.stderr.write("SFTP transport scheduler failed\n");
    process.exitCode = 1;
}