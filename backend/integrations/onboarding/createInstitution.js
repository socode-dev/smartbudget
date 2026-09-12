import { createHash } from "node:crypto";
import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import { assertDocumentId, validateSftpSettings, SFTP_INTEGRATION_STATUSES } from "../sftp/sftpSettings.js";

export const createInstitution = async ({
    requestId,
    name,
    sftpConfig,
} = {}) => {
    assertDocumentId(requestId, "INVALID_ONBOARDING_REQUEST_ID");

    if (typeof name !== "string" || !name.trim())
        throw new Error("INVALID_INSTITUTION_NAME");

    const normalizedName = name.trim();
    const settings = validateSftpSettings(sftpConfig);

    const requestHash = createHash("sha256")
        .update(JSON.stringify({
            name: normalizedName,
            settings,
        }))
        .digest("hex");

    const requestRef = db
        .collection("integrationOnboardingRequests")
        .doc(requestId);

    const institutionRef = db.collection("institutions").doc();
    const pilotRef = institutionRef.collection("pilots").doc();
    const integrationRef = institutionRef.collection("integrations").doc("sftp");

    return db.runTransaction(async transaction => {
        const existing = await transaction.get(requestRef);

        if (existing.exists) {
            const previous = existing.data();

            if (previous.requestHash !== requestHash)
                throw new Error("ONBOARDING_REQUEST_CONFLICT");

            if (
                previous.status !== "COMPLETED" ||
                !previous.institutionId ||
                !previous.pilotId
            )
                throw new Error("INVALID_ONBOARDING_REQUEST_STATE");

            return {
                institutionId: previous.institutionId,
                pilotId: previous.pilotId,
            };
        }

        const timestamp = FieldValue.serverTimestamp();

        transaction.create(institutionRef, {
            name: normalizedName,
            status: "ACTIVE",
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        transaction.create(pilotRef, {
            status: "ACTIVE",
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        transaction.create(integrationRef, {
            ...settings,
            status: SFTP_INTEGRATION_STATUSES.DISABLED,
            importPilotId: pilotRef.id,
            revision: 1,
            verifiedRevision: null,
            verifiedAt: null,
            verificationAttemptId: null,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        transaction.create(requestRef, {
            institutionId: institutionRef.id,
            pilotId: pilotRef.id,
            requestHash,
            status: "COMPLETED",
            createdAt: timestamp,
        });

        return {
            institutionId: institutionRef.id,
            pilotId: pilotRef.id,
        };
    });
};