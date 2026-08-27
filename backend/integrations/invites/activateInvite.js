import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import {
    INVITE_STATE_STATUSES,
    INVITE_STATUSES,
    PILOT_IDENTITY_STATUSES
} from "./inviteTypes.js";
import { getInviteByToken } from "./validateInvite.js";

const MIGRATION_BATCH_SIZE = 400;

export const activateInvite = async ({
    token,
    authUid,
    email,
    now = Date.now(),
    migrateTransactions = true,
} = {}) => {
    if (!token || !authUid || !email) {
        throw new Error("MISSING_ACTIVATION_PARAMS");
    }

    const inviteDoc = await getInviteByToken(token);
    const inviteRef = inviteDoc.ref;

    const activation = await claimInvite({
        inviteRef,
        authUid,
        email,
        now,
    });

    if (activation.error) {
        throw new Error(activation.error);
    }

    if (migrateTransactions) {
        await migratePilotTransactionsToUser({
            importCustomerId: activation.importCustomerId,
            userId: activation.userId,
        });
    }

    return activation;
};

export const migratePilotTransactionsToUser = async ({
    importCustomerId,
    userId,
    batchSize = MIGRATION_BATCH_SIZE,
} = {}) => {
    if (!importCustomerId || !userId) {
        throw new Error("MISSING_TRANSACTION_MIGRATION_PARAMS");
    }

    const sourceRef = db
        .collection("pilotCustomers")
        .doc(importCustomerId)
        .collection("transactions");

    const targetRef = db
        .collection("users")
        .doc(userId)
        .collection("transactions");

    while (true) {
        const snapshot = await sourceRef.limit(batchSize).get();

        if (snapshot.empty) {
            break;
        }

        const batch = db.batch();

        snapshot.docs.forEach(doc => {
            batch.set(
                targetRef.doc(doc.id),
                {
                    ...doc.data(),
                    ownerType: "USER",
                    migratedFromImportCustomerId: importCustomerId,
                    migratedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

            batch.delete(doc.ref);
        });

        await batch.commit();
    }

    await finalizeActivation({ importCustomerId, userId });
};

const claimInvite = ({
    inviteRef,
    authUid,
    email,
    now,
}) => {
    return db.runTransaction(async transaction => {
        const inviteSnapshot = await transaction.get(inviteRef);

        if (!inviteSnapshot.exists) {
            throw new Error("INVITE_NOT_FOUND");
        }

        const invite = inviteSnapshot.data();

        if (
            invite.status === INVITE_STATUSES.USED &&
            invite.usedByUserId === authUid
        ) {
            return buildActivationResult({
                invite,
                userId: authUid,
                alreadyActivated: true,
            });
        }

        if (invite.status !== INVITE_STATUSES.ACTIVE) {
            throw new Error("INVITE_NOT_ACTIVE");
        }

        if (Number(invite.expiresAtMs) <= now) {
            transaction.update(inviteRef, {
                status: INVITE_STATUSES.EXPIRED,
                expiredAt: FieldValue.serverTimestamp(),
            });

            transaction.set(
                db
                    .collection("pilotInviteStates")
                    .doc(invite.importCustomerId),
                {
                    status: INVITE_STATE_STATUSES.EXPIRED,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

            return {
                error: "INVITE_EXPIRED",
            };
        }

        if (invite.usedAt || invite.usedByUserId) {
            throw new Error("INVITE_ALREADY_USED");
        }
        
        const identityRef = db
        .collection("pilotIdentities")
        .doc(invite.importCustomerId);
        
        const identitySnapshot = await transaction.get(identityRef);
        
        const userRef = db.collection("users").doc(authUid);
        const userSnapshot = await transaction.get(userRef);
        
        if (
            userSnapshot.exists &&
            userSnapshot.data().importCustomerId &&
            userSnapshot.data().importCustomerId !== invite.importCustomerId
        ) {
            throw new Error("AUTH_USER_ALREADY_LINKED");
        }

        if (identitySnapshot.exists) {
            const identity = identitySnapshot.data();

            if (
                identity.status === PILOT_IDENTITY_STATUSES.CLAIMED &&
                identity.userId !== authUid
            ) {
                throw new Error("CUSTOMER_ALREADY_CLAIMED");
            }

            if (
                identity.status === PILOT_IDENTITY_STATUSES.MIGRATING &&
                identity.userId !== authUid
            ) {
                throw new Error("CUSTOMER_ACTIVATION_IN_PROGRESS");
            }
        }

        const inviteStateRef = db
            .collection("pilotInviteStates")
            .doc(invite.importCustomerId);

        transaction.set(
            identityRef,
            {
                importCustomerId: invite.importCustomerId,
                userId: authUid,
                institutionId: invite.institutionId,
                pilotId: invite.pilotId,
                cohortId: invite.cohortId ?? null,
                status: PILOT_IDENTITY_STATUSES.MIGRATING,
                migrationStartedAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        const userData = {
            uid: authUid,
            email,
            institutionId: invite.institutionId,
            pilotId: invite.pilotId,
            cohortId: invite.cohortId ?? null,
            importCustomerId: invite.importCustomerId,
            source: "institution_invite",
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (!userSnapshot.exists) {
            userData.createdAt = FieldValue.serverTimestamp();
        }

        transaction.set(userRef, userData, { merge: true });

        transaction.update(inviteRef, {
            status: INVITE_STATUSES.USED,
            usedAt: FieldValue.serverTimestamp(),
            usedByUserId: authUid,
        });

        transaction.set(
            inviteStateRef,
            {
                importCustomerId: invite.importCustomerId,
                institutionId: invite.institutionId,
                pilotId: invite.pilotId,
                cohortId: invite.cohortId ?? null,
                inviteId: invite.inviteId,
                status: INVITE_STATE_STATUSES.MIGRATING,
                userId: authUid,
                migrationStartedAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        return buildActivationResult({
            invite,
            userId: authUid,
            alreadyActivated: false,
        });
    });
};

const buildActivationResult = ({
    invite,
    userId,
    alreadyActivated,
}) => ({
    userId,
    importCustomerId: invite.importCustomerId,
    institutionId: invite.institutionId,
    pilotId: invite.pilotId,
    cohortId: invite.cohortId ?? null,
    alreadyActivated,
});

const finalizeActivation = async ({
    importCustomerId,
    userId,
} = {}) => {
    const remainTransactions = await db
        .collection("pilotCustomers")
        .doc(importCustomerId)
        .collection("transactions")
        .limit(1)
        .get();

    if (!remainTransactions.empty) {
        throw new Error("TRANSACTION_MIGRATION_INCOMPLETE");
    }

    const batch = db.batch();

    batch.set(
        db.collection("pilotIdentities").doc(importCustomerId),
        {
            status: PILOT_IDENTITY_STATUSES.CLAIMED,
            claimedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    batch.set(
        db.collection("pilotInviteStates").doc(importCustomerId),
        {
            status: INVITE_STATE_STATUSES.CLAIMED,
            userId,
            claimedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    batch.set(
        db.collection("pilotCustomers").doc(importCustomerId),
            {
                status: "CLAIMED",
                claimedUserId: userId,
                claimedAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

    await batch.commit();
};
