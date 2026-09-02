const csvEscape = (value) => {
    const text = String(value ?? "");

    if (!/[",\r\n]/.test(text)) return text;

    return `"${text.replace(/"/g, '""')}"`;
};

export const buildInvitationCsv = (inviteExports = []) => {
    const rows = [
        ["customer_id", "activation_link"],
        ...inviteExports.map(item => [
            item.customerId ?? item.customer_id,
            item.activationLink ?? item.activation_link,
        ]),
    ];

    return rows.map(row => row.map(csvEscape).join(",")).join("\n");
};

export const buildInvitationExportFileName = ({ batchId, importId }) => {
    const safeBatchId = String(batchId || importId || "batch").replace(
        /[^a-zA-Z0-9]/g,
        "_",
    );

    return `invitations_${safeBatchId}.csv`;
}