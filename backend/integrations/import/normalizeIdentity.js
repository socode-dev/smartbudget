import { createHmac } from "crypto";

const getImportSecret = (secret) => {
    const resolvedSecret = secret || process.env.SFTP_IMPORT_HMAC_SECRET;

    if (!resolvedSecret) {
        throw new Error("MISSING_SFTP_IMPORT_HMAC_SECRET");
    }

    return resolvedSecret;
}

export const normalizeExternalId = ({
    institutionId,
    value,
    namespace,
    secret
} = {}) => {
    if (!institutionId) throw new Error("MISSING_INSTITUTION_ID");
    if (!value) throw new Error("MISSING_EXTERNAL_ID");
    if (!namespace) throw new Error("MISSING_ID_NAMESPACE");

    return createHmac("sha256", getImportSecret(secret))
    .update(`${namespace}:${institutionId}:${String(value).trim()}`)
    .digest("hex");
}

export const normalizeCustomerId = ({ institutionId, customerId, secret }) => {
    return normalizeExternalId({
        institutionId,
        value: customerId,
        namespace: "customer",
        secret
    });
};

export const normalizeTransactionId = ({
    institutionId,
    transactionId,
    secret,
}) => {
    return normalizeExternalId({
        institutionId,
        value: transactionId,
        namespace: "transaction",
        secret,
    });
};