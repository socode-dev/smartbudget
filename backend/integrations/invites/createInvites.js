import { createHash, randomBytes, randomUUID } from "crypto";
import { db, FieldValue } from "../../../lib/firebaseAdmin.js";
import {
    INVITE_DEFAULT_TTL_DAYS,
    INVITE_STATE_STATUSES,
    INVITE_STATUSES,
    PILOT_IDENTITY_STATUSES
} from "./inviteTypes.js";

const TOKEN_BYTES = 32;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const createInviteToken = () => {
    return randomBytes(TOKEN_BYTES).toString("base64url");
};

export const hashInviteToken = token => {
    return createHash("sha256")
    .update(String(token))
    .digest("hex");
};

export const buildActivationLink = ({ activationBaseUrl, token }) => {
    const url = new URL("/activate", activationBaseUrl);
    url.searchParams.set("token", token);

    return url.toString();
};

export const createInvites = async ({
    customers,
    institutionId,
    pilotId,
    cohortId = null,
    importId,
    activationBaseUrl,
    ttlDays = INVITE_DEFAULT_TTL_DAYS
} = {}) => {
    if (!Array.isArray(customers)) {
        throw new Error("MISSING_INVITE_CUSTOMERS");
    }

    if (!institutionId || !pilotId || !activationBaseUrl) {
        throw new Error("MISSING_INVITE_SCOPE");
    }

    const now = Date.now();
    const expiresAtMs = now + ttlDays * MS_PER_DAY;

    const inviteExports = [];
    const createdInvites = [];
    const skippedInvites = [];

    for (const customer of customers) {
        const result = await createInviteForCustomer({
            customer,
            institutionId,
            pilotId,
            cohortId,
            importId,
            now,
            expiresAtMs,
        });

        if (result.skipped) {
            skippedInvites.push({
                importCustomerId: customer.importCustomerId,
                reason: result.reason,
                inviteId: result.inviteId,
            });

            continue;
        }

        const activationLink = buildActivationLink({ 
            activationBaseUrl, 
            token: result.rawToken 
        });

        createdInvites.push({
            inviteId: result.inviteId,
            importCustomerId: customer.importCustomerId,
        });

        inviteExports.push({
            customer_id: customer.rawCustomerId,
            activation_link: activationLink,
        });
    }

    return {
        inviteExports,
        createdInvites,
        skippedInvites
    };
};

const createInviteForCustomer = ({
    customer,
    institutionId,
    pilotId,
    cohortId,
    importId,
    now,
    expiresAtMs,
}) => {
    return db.runTransaction(async transaction => {
        const identityRef = db
            .collection("pilotIdentities")
            .doc(customer.importCustomerId);

        const stateRef = db
            .collection("pilotInviteStates")
            .doc(customer.importCustomerId);

        const activeInviteQuery = db
            .collection("invites")
            .where("importCustomerId", "==", customer.importCustomerId)
            .where("institutionId", "==", institutionId)
            .where("pilotId", "==", pilotId)
            .where("status", "==", INVITE_STATUSES.ACTIVE);

        const identitySnapshot = await transaction.get(identityRef);
        const stateSnapshot = await transaction.get(stateRef);
        const activeInviteSnapshot = await transaction.get(activeInviteQuery);

        if (
            identitySnapshot.exists &&
            [
                PILOT_IDENTITY_STATUSES.CLAIMED,
                PILOT_IDENTITY_STATUSES.MIGRATING,
            ].includes(identitySnapshot.data().status)
        ) {
            return {
                skipped: true,
                reason: "CUSTOMER_ALREADY_CLAIMED",
            };
        }

        if (
            stateSnapshot.exists &&
            stateSnapshot.data().status === INVITE_STATE_STATUSES.CLAIMED
        ) {
            return {
                skipped: true,
                reason: "CUSTOMER_ALREADY_CLAIMED",
            };
        }

        const activeInviteDoc = activeInviteSnapshot.docs.find(doc => {
            const activeInvite = doc.data();

            return Number(activeInvite.expiresAtMs) > now;
        }) ?? null;

        if (activeInviteDoc) {
            const activeInvite = activeInviteDoc.data();

            transaction.set(
                stateRef,
                {
                    importCustomerId: customer.importCustomerId,
                    institutionId,
                    pilotId,
                    cohortId,
                    inviteId: activeInviteDoc.id,
                    status: INVITE_STATE_STATUSES.ACTIVE,
                    expiresAtMs: activeInvite.expiresAtMs,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

            return {
                skipped: true,
                reason: "ACTIVE_INVITE_EXISTS",
                inviteId: activeInviteDoc.id,
            };
        }

        activeInviteSnapshot.docs.forEach(doc => {
            const expiredInvite = doc.data();

            transaction.update(doc.ref, {
                status: INVITE_STATUSES.EXPIRED,
                expiredAt: FieldValue.serverTimestamp(),
            });

            transaction.set(
                stateRef,
                {
                    importCustomerId: customer.importCustomerId,
                    institutionId,
                    pilotId,
                    cohortId,
                    inviteId: doc.id,
                    status: INVITE_STATE_STATUSES.EXPIRED,
                    expiresAtMs: expiredInvite.expiresAtMs,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
        });

        const rawToken = createInviteToken();
        const tokenHash = hashInviteToken(rawToken);
        const inviteId = `invite_${randomUUID()}`;
        const inviteRef = db.collection("invites").doc(inviteId);

        transaction.set(inviteRef, {
            inviteId,
            importCustomerId: customer.importCustomerId,
            institutionId,
            pilotId,
            cohortId,
            importId,
            tokenHash,
            status: INVITE_STATUSES.ACTIVE,
            expiresAtMs,
            createdAt: FieldValue.serverTimestamp(),
            usedAt: null,
            usedByUserId: null,
        });

        transaction.set(stateRef, {
            importCustomerId: customer.importCustomerId,
            institutionId,
            pilotId,
            cohortId,
            inviteId,
            status: INVITE_STATE_STATUSES.ACTIVE,
            expiresAtMs,
            updatedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
        });

        return {
            skipped: false,
            inviteId,
            rawToken,
        };
    });
};
