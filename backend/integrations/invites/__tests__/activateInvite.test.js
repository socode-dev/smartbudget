import { describe, expect, it } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { createInvites } from "../createInvites.js";
import {
    activateInvite,
    migratePilotTransactionsToUser
} from "../activateInvite.js";
import {
    INVITE_STATE_STATUSES,
    INVITE_STATUSES,
    PILOT_IDENTITY_STATUSES
} from "../inviteTypes.js";

const ACTIVATION_BASE_URL = "https://smartbudget.app";

const createInviteAndToken = async ({
    importCustomerId = "import-customer-001",
    ttlDays = 7,
} = {}) => {
    const result = await createInvites({
        customers: [
            {
                rawCustomerId: "CUST-001",
                importCustomerId,
            },
        ],
        institutionId: "ins-a",
        pilotId: "pilot-001",
        importId: "import-001",
        activationBaseUrl: ACTIVATION_BASE_URL,
        ttlDays,
    });

    const token = new URL(
        result.inviteExports[0].activation_link
    ).searchParams.get("token");

    return { token };
};

describe("activateInvite()", () => {
    it("claims an active invite for a Firebase Auth user", async () => {
        const { token } = await createInviteAndToken();

        const result = await activateInvite({
            token,
            authUid: "firebase-user-001",
            email: "customer@example.com",
        });

        const identity = await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .get();

        const user = await db
            .collection("users")
            .doc("firebase-user-001")
            .get();

        const invites = await db.collection("invites").get();
        const invite = invites.docs[0].data();

        const state = await db
            .collection("pilotInviteStates")
            .doc("import-customer-001")
            .get();

        expect(result).toMatchObject({
            userId: "firebase-user-001",
            importCustomerId: "import-customer-001",
            alreadyActivated: false,
        });

        expect(identity.data()).toMatchObject({
            importCustomerId: "import-customer-001",
            userId: "firebase-user-001",
            institutionId: "ins-a",
            pilotId: "pilot-001",
            status: "CLAIMED",
        });

        expect(user.data()).toMatchObject({
            uid: "firebase-user-001",
            email: "customer@example.com",
            importCustomerId: "import-customer-001",
            source: "institution_invite",
        });

        expect(invite.status).toBe(INVITE_STATUSES.USED);
        expect(invite.usedByUserId).toBe("firebase-user-001");

        expect(state.data()).toMatchObject({
            status: INVITE_STATE_STATUSES.CLAIMED,
            userId: "firebase-user-001",
        });
    });

    it("does not allow a second user to consume the same invite", async () => {
        const { token } = await createInviteAndToken();

        await activateInvite({
            token,
            authUid: "firebase-user-001",
            email: "customer@example.com",
        });

        await expect(
            activateInvite({
                token,
                authUid: "firebase-user-002",
                email: "other@example.com",
            })
        ).rejects.toThrow("INVITE_NOT_ACTIVE");
    });

    it("allows the same user to retry a used invite and finish migration", async () => {
        const { token } = await createInviteAndToken();

        await db
            .collection("pilotCustomers")
            .doc("import-customer-001")
            .collection("transactions")
            .doc("tx-001")
            .set({
                id: "tx-001",
                amount: 100,
                ownerType: "PILOT_CUSTOMER",
            });

        await activateInvite({
            token,
            authUid: "firebase-user-001",
            email: "customer@example.com",
            migrateTransactions: false,
        });

        const identityBeforeRetry = await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .get();

        expect(identityBeforeRetry.data().status).toBe(
            PILOT_IDENTITY_STATUSES.MIGRATING
        );

        const result = await activateInvite({
            token,
            authUid: "firebase-user-001",
            email: "customer@example.com",
        });

        const migratedTransaction = await db
            .collection("users")
            .doc("firebase-user-001")
            .collection("transactions")
            .doc("tx-001")
            .get();

        const stagedTransaction = await db
            .collection("pilotCustomers")
            .doc("import-customer-001")
            .collection("transactions")
            .doc("tx-001")
            .get();

        expect(result.alreadyActivated).toBe(true);
        expect(migratedTransaction.exists).toBe(true);
        expect(migratedTransaction.data()).toMatchObject({
            id: "tx-001",
            amount: 100,
            ownerType: "USER",
            migratedFromImportCustomerId: "import-customer-001",
        });
        expect(stagedTransaction.exists).toBe(false);
    });

    it("marks expired active invite as expired", async () => {
        const { token } = await createInviteAndToken({
            ttlDays: -1,
        });

        await expect(
            activateInvite({
                token,
                authUid: "firebase-user-001",
                email: "customer@example.com",
            })
        ).rejects.toThrow("INVITE_EXPIRED");

        const invites = await db.collection("invites").get();
        const invite = invites.docs[0].data();

        const state = await db
            .collection("pilotInviteStates")
            .doc("import-customer-001")
            .get();

        expect(invite.status).toBe(INVITE_STATUSES.EXPIRED);
        expect(state.data().status).toBe(INVITE_STATE_STATUSES.EXPIRED);
    });
});

describe("migratePilotTransactionsToUser()", () => {
    it("moves pre-activation transactions to the user transaction collection", async () => {
        await db
            .collection("pilotCustomers")
            .doc("import-customer-001")
            .collection("transactions")
            .doc("tx-001")
            .set({
                id: "tx-001",
                amount: 250,
                ownerType: "PILOT_CUSTOMER",
            });

        await migratePilotTransactionsToUser({
            importCustomerId: "import-customer-001",
            userId: "firebase-user-001",
        });

        const migratedTransaction = await db
            .collection("users")
            .doc("firebase-user-001")
            .collection("transactions")
            .doc("tx-001")
            .get();

        const stagedTransaction = await db
            .collection("pilotCustomers")
            .doc("import-customer-001")
            .collection("transactions")
            .doc("tx-001")
            .get();

        const pilotCustomer = await db
            .collection("pilotCustomers")
            .doc("import-customer-001")
            .get();

        expect(migratedTransaction.exists).toBe(true);
        expect(migratedTransaction.data()).toMatchObject({
            id: "tx-001",
            amount: 250,
            ownerType: "USER",
            migratedFromImportCustomerId: "import-customer-001",
        });
        expect(stagedTransaction.exists).toBe(false);
        expect(pilotCustomer.data()).toMatchObject({
            status: "CLAIMED",
            claimedUserId: "firebase-user-001",
        });
    });
});
