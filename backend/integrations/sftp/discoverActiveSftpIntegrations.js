import { db } from "../../../lib/firebaseAdmin.js";
import { SFTP_INTEGRATION_STATUSES } from "./sftpSettings.js";

export const discoverActiveSftpIntegrations = async () => {
    const snapshot = await db
        .collectionGroup("integrations")
        .where("status", "==", SFTP_INTEGRATION_STATUSES.ACTIVE)
        .get();

    const institutionIds = new Set();

    for (const document of snapshot.docs) {
        const segments = document.ref.path.split("/");

        if (
            segments.length === 4 &&
            segments[0] === "institutions" &&
            segments[2] === "integrations" &&
            segments[3] === "sftp"
        ) {
            institutionIds.add(segments[1]);
        }
    }

    return [...institutionIds]
        .sort()
        .map(institutionId => ({ institutionId }));
};