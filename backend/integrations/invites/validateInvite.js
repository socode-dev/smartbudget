import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import {
    INVITE_STATE_STATUSES,
    INVITE_STATUSES
} from "./inviteTypes.js";
import { hashInviteToken } from "./createInvites.js";

export const validateInvite = async ({
    token,
    now = Date.now()
} = {}) => {
    if (!token) {
        throw new Error("MISSING_INVITE_TOKEN");
    }

    const inviteDoc = await getInviteByToken(token);
    const invite = inviteDoc.data();

    if (
        invite.status === INVITE_STATUSES.ACTIVE &&
        Number(invite.expiresAtMs) <= now
    ) {
        await expireInvite({
            inviteRef: inviteDoc.ref,
            invite,
        });

        throw new Error("INVITE_EXPIRED");
    }

    if (invite.status !== INVITE_STATUSES.ACTIVE) {
        throw new Error("INVITE_NOT_ACTIVE");
    }

    if (Number(invite.expiresAtMs) <= now) {
        throw new Error("INVITE_EXPIRED");
    }

    return {
        inviteId: inviteDoc.id,
        importCustomerId: invite.importCustomerId,
        institutionId: invite.institutionId,
        pilotId: invite.pilotId,
        cohortId: invite.cohortId ?? null,
        expiresAtMs: invite.expiresAtMs,
    };
};

const expireInvite = async ({ inviteRef, invite }) => {
    const batch = db.batch();

    batch.update(inviteRef, {
        status: INVITE_STATUSES.EXPIRED,
        expiredAt: FieldValue.serverTimestamp(),
    });

    batch.set(
        db.collection("pilotInviteStates").doc(invite.importCustomerId),
        {
            importCustomerId: invite.importCustomerId,
            institutionId: invite.institutionId,
            pilotId: invite.pilotId,
            cohortId: invite.cohortId ?? null,
            inviteId: invite.inviteId,
            status: INVITE_STATE_STATUSES.EXPIRED,
            expiresAtMs: invite.expiresAtMs,
            updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    await batch.commit();
};


export const getInviteByToken = async token => {
    if (!token) {
        throw new Error("MISSING_INVITE_TOKEN");
    }

    const snapshot = await db
    .collection("invites")
    .where("tokenHash", "==", hashInviteToken(token))
    .limit(1)
    .get();

    if (snapshot.empty) {
        throw new Error("INVITE_NOT_FOUND");
    }

    return snapshot.docs[0];
}