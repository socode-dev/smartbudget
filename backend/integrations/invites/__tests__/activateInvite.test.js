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
    await db
        .collection("pilotCustomers")
        .doc(importCustomerId)
        .set({
            importCustomerId,
            institutionId: "ins-a",
            pilotId: "pilot-001",
            status: "PENDING_ACTIVATION",
            profile: {
                firstName: "Amina",
                lastName: "Yusuf",
                fullName: "Amina Yusuf",
            },
        });

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
    it("requires token, auth uid, and email", async () => {
        await expect(activateInvite()).rejects.toThrow(
            "MISSING_ACTIVATION_PARAMS"
        );

        await expect(
            activateInvite({
                token: "token",
                authUid: "firebase-user-001",
            })
        ).rejects.toThrow("MISSING_ACTIVATION_PARAMS");
    });

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
            profile: {
                firstName: "Amina",
                lastName: "Yusuf",
                fullName: "Amina Yusuf",
                email: "customer@example.com",
            },
            thresholds: {
                transactionThreshold: 50000,
                budgetThreshold50: 50,
                budgetThreshold80: 80,
                budgetThreshold100: 100,
                goalThreshold50: 50,
                goalThreshold80: 80,
                goalThreshold100: 100,
            },
        });

        expect(invite.status).toBe(INVITE_STATUSES.USED);
        expect(invite.usedByUserId).toBe("firebase-user-001");

        expect(state.data()).toMatchObject({
            status: INVITE_STATE_STATUSES.CLAIMED,
            userId: "firebase-user-001",
        });
    });

    it("preserves an existing user profile while filling missing imported fields", async () => {
        const { token } = await createInviteAndToken();

        await db
            .collection("users")
            .doc("firebase-user-001")
            .set({
                profile: {
                    firstName: "Preferred",
                },
            });

        await activateInvite({
            token,
            authUid: "firebase-user-001",
            email: "customer@example.com",
        });

        const user = await db
            .collection("users")
            .doc("firebase-user-001")
            .get();

        expect(user.data().profile).toMatchObject({
            firstName: "Preferred",
            lastName: "Yusuf",
            fullName: "Amina Yusuf",
            email: "customer@example.com",
        });
    });

    it("does not overwrite existing user thresholds during activation", async () => {
        const { token } = await createInviteAndToken();

        await db
            .collection("users")
            .doc("firebase-user-001")
            .set({
                uid: "firebase-user-001",
                email: "customer@example.com",
                thresholds: {
                    transactionThreshold: 20000,
                    budgetThreshold50: 60,
                    budgetThreshold80: 90,
                    budgetThreshold100: 120,
                    goalThreshold50: 40,
                    goalThreshold80: 70,
                    goalThreshold100: 95,
                },
            });

        await activateInvite({
            token,
            authUid: "firebase-user-001",
            email: "customer@example.com",
        });

        const user = await db
            .collection("users")
            .doc("firebase-user-001")
            .get();

        expect(user.data().thresholds).toMatchObject({
            transactionThreshold: 20000,
            budgetThreshold50: 60,
            budgetThreshold80: 90,
            budgetThreshold100: 120,
            goalThreshold50: 40,
            goalThreshold80: 70,
            goalThreshold100: 95,
        });
    });

    it("migrates pre-activation transactions during normal activation", async () => {
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

        const identity = await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .get();

        expect(migratedTransaction.exists).toBe(true);
        expect(migratedTransaction.data()).toMatchObject({
            id: "tx-001",
            amount: 100,
            ownerType: "USER",
            migratedFromImportCustomerId: "import-customer-001",
        });
        expect(stagedTransaction.exists).toBe(false);
        expect(identity.data().status).toBe(PILOT_IDENTITY_STATUSES.CLAIMED);
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

    it("does not allow a different user to claim an already claimed customer identity", async () => {
        const { token } = await createInviteAndToken();

        await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .set({
                importCustomerId: "import-customer-001",
                userId: "firebase-user-001",
                institutionId: "ins-a",
                pilotId: "pilot-001",
                status: PILOT_IDENTITY_STATUSES.CLAIMED,
            });

        await expect(
            activateInvite({
                token,
                authUid: "firebase-user-002",
                email: "other@example.com",
            })
        ).rejects.toThrow("CUSTOMER_ALREADY_CLAIMED");
    });

    it("does not allow a different user to claim a migrating customer identity", async () => {
        const { token } = await createInviteAndToken();

        await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .set({
                importCustomerId: "import-customer-001",
                userId: "firebase-user-001",
                institutionId: "ins-a",
                pilotId: "pilot-001",
                status: PILOT_IDENTITY_STATUSES.MIGRATING,
            });

        await expect(
            activateInvite({
                token,
                authUid: "firebase-user-002",
                email: "other@example.com",
            })
        ).rejects.toThrow("CUSTOMER_ACTIVATION_IN_PROGRESS");
    });

    it("does not allow an auth user already linked to another import customer to activate a new invite", async () => {
        const { token } = await createInviteAndToken({
            importCustomerId: "import-customer-002",
        });

        await db
            .collection("users")
            .doc("firebase-user-001")
            .set({
                uid: "firebase-user-001",
                email: "customer@example.com",
                importCustomerId: "import-customer-001",
            });

        await expect(
            activateInvite({
                token,
                authUid: "firebase-user-001",
                email: "customer@example.com",
            })
        ).rejects.toThrow("AUTH_USER_ALREADY_LINKED");
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
