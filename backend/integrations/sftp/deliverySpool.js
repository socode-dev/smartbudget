import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { db, FieldValue } from "../../../lib/firebaseAdmin.js";

const ALGORITHM = "aes-256-gcm";
const DEFAULT_TTL_MS = 60 * 60 * 1000;

const getEncryptionKey = () => {
    const rawKey = process.env.SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY;

    if (!rawKey) 
        throw new Error("MISSING_SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY");

    const key = Buffer.from(rawKey, "base64");

    if (key.length !== 32)
        throw new Error("INVALID_SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY");

    return key;
};

const encryptJson = (payload) => {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    const ciphertext = Buffer.concat([
        cipher.update(JSON.stringify(payload), "utf8"),
        cipher.final(),
    ]);

    return {
        iv: iv.toString("base64"),
        ciphertext: ciphertext.toString("base64"),
        authTag: cipher.getAuthTag().toString("base64"),
    };
};

export const decryptSpoolPayload = (spool) => {
    const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(spool.iv, "base64"));

    decipher.setAuthTag(Buffer.from(spool.authTag, "base64"));

    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(spool.ciphertext, "base64")),
        decipher.final(),
    ]);

    return JSON.parse(plaintext.toString("utf8"));
};

const spoolCollection = ({ institutionId, pilotId }) => 
    db
        .collection("institutions")
        .doc(institutionId)
        .collection("pilots")
        .doc(pilotId)
        .collection("deliverySpool");

export const createInvitationDeliverySpool = async ({
    institutionId,
    pilotId,
    importId,
    fileName,
    batchId,
    invitationFileName,
    invitationCsv,
    now = Date.now()
} = {}) => {
    if (!institutionId || !pilotId || !importId || !invitationCsv)
        throw new Error("MISSING_DELIVERY_SPOOL_PARAMS");

    const spoolId = `invite_export_${importId}`;
    const encrypted = encryptJson({ invitationCsv });

    await spoolCollection({ institutionId, pilotId })
        .doc(spoolId)
        .set({
        spoolId,
        type: "INVITATION_EXPORT",
        status: "PENDING_DELIVERY",
        importId,
        sourceFileName: fileName,
        batchId,
        invitationFileName,
        ...encrypted,
        expiresAtMs: now + DEFAULT_TTL_MS,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(), 
    });

    return {
        spoolId,
        invitationFileName
    };
};

export const getInvitationDeliverySpool = async ({
    institutionId,
    pilotId,
    spoolId,
} = {}) => {
    const snapshot = await spoolCollection({ institutionId, pilotId })
        .doc(spoolId)
        .get();

    if (!snapshot.exists)
        throw new Error("DELIVERY_SPOOL_NOT_FOUND");

    return {
        ref: snapshot.ref,
        data: snapshot.data(),
    };
};

export const deleteInvitationDeliverySpool = async ({
    institutionId,
    pilotId,
    spoolId,
} = {}) => 
    await spoolCollection({ institutionId, pilotId })
        .doc(spoolId)
        .delete();

export const markInvitationDeliveryFailed = async ({
    institutionId,
    pilotId,
    spoolId,
    errorCode,
} = {}) =>
    await spoolCollection({ institutionId, pilotId })
        .doc(spoolId).set(
            {
                status: "DELIVERY_FAILED",
                errorCode,
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
        );

export const listRetryableInvitationDeliverySpools = async ({
    institutionId,
    pilotId,
    limit = 20,
    now = Date.now(),
} = {}) => {
    if (!institutionId || !pilotId)
        throw new Error("MISSING_DELIVERY_SPOOL_SCOPE");

    const snapshot = await spoolCollection({ institutionId, pilotId })
        .where("type", "==", "INVITATION_EXPORT")
        .where("status", "in", ["PENDING_DELIVERY", "DELIVERY_FAILED"])
        .limit(limit)
        .get();

    return snapshot.docs
        .map(doc => ({
            ref: doc.ref,
            data: doc.data(),
        }))
        .filter(({ data }) => !data.expiresAtMs || data.expiresAtMs > now);
};