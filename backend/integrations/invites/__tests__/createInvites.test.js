import { describe, expect, it } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import {
    createInviteToken,
    createInvites,
    hashInviteToken
} from "../createInvites.js";
import {
    INVITE_STATE_STATUSES,
    INVITE_STATUSES,
    PILOT_IDENTITY_STATUSES
} from "../inviteTypes.js";

describe("createInvites()", () => {
    it("generates cryptographically strong url-safe tokens", () => {
        const tokens = new Set(
            Array.from({ length: 25 }, () => createInviteToken())
        );

        expect(tokens.size).toBe(25);

        tokens.forEach(token => {
            expect(token).toHaveLength(43);
            expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
        });
    });

    it("stores only token hash, not raw token", async () => {
        const result = await createInvites({
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        });

        const token = new URL(
            result.inviteExports[0].activation_link
        ).searchParams.get("token");

        const invites = await db.collection("invites").get();
        const invite = invites.docs[0].data();

        expect(invite.tokenHash).toBe(hashInviteToken(token));
        expect(JSON.stringify(invite)).not.toContain(token);
    });

    it("does not persist raw bank customer id", async () => {
        await createInvites({
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        });

        const collections = await Promise.all([
            db.collection("invites").get(),
            db.collection("pilotInviteStates").get(),
        ]);

        collections.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
                expect(JSON.stringify(doc.data())).not.toContain("CUST-001");
            });
        });
    });

    it("gives different customers different tokens", async () => {
        const result = await createInvites({
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
                {
                    rawCustomerId: "CUST-002",
                    importCustomerId: "import-customer-002"
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        });

        const tokens = result.inviteExports.map(row => 
            new URL(row.activation_link).searchParams.get("token")
        );

        expect(tokens[0]).not.toBe(tokens[1]);
    });

    it("does not create another invite when active invite already exists", async () => {
        const args = {
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        };

        await createInvites(args);

        const second = await createInvites({
            ...args,
            importId: "import-002",
        });

        const invites = await db.collection("invites").get();

        expect(invites.size).toBe(1);
        expect(second.inviteExports).toHaveLength(0);
        expect(second.skippedInvites[0].reason).toBe("ACTIVE_INVITE_EXISTS");
    });

    it("prevents duplicate active invites during concurrent imports", async () => {
        const args = {
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        };

        const results = await Promise.all([
            createInvites(args),
            createInvites({ ...args, importId: "import-002" }),
        ]);

        const invites = await db.collection("invites").get();
        const activeInvites = invites.docs.filter(
            doc => doc.data().status === INVITE_STATUSES.ACTIVE
        );
        const createdExports = results.flatMap(result => result.inviteExports);
        const skippedInvites = results.flatMap(result => result.skippedInvites);

        expect(invites.size).toBe(1);
        expect(activeInvites).toHaveLength(1);
        expect(createdExports).toHaveLength(1);
        expect(skippedInvites).toHaveLength(1);
        expect(skippedInvites[0].reason).toBe("ACTIVE_INVITE_EXISTS");
    });

    it("expires old active invite before issuing a new invite", async () => {
        const args = {
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        };

        await createInvites({
            ...args,
            ttlDays: -1,
        });

        const second = await createInvites({
            ...args,
            importId: "import-002",
        });

        const invites = await db.collection("invites").get();
        const statuses = invites.docs.map(doc => doc.data().status);
        const state = await db
            .collection("pilotInviteStates")
            .doc("import-customer-001")
            .get();

        expect(invites.size).toBe(2);
        expect(statuses).toContain(INVITE_STATUSES.EXPIRED);
        expect(statuses).toContain(INVITE_STATUSES.ACTIVE);
        expect(second.inviteExports).toHaveLength(1);
        expect(state.data().status).toBe(INVITE_STATE_STATUSES.ACTIVE);
    });

    it("does not create invite for claimed customer", async () => {
        await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .set({
                userId: "firebase-user-001",
                institutionId: "ins-a",
                pilotId: "pilot-001",
                status: PILOT_IDENTITY_STATUSES.CLAIMED,
            });

        const result = await createInvites({
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        });

        const invites = await db.collection("invites").get();

        expect(invites.size).toBe(0);
        expect(result.inviteExports).toHaveLength(0);
        expect(result.skippedInvites[0].reason).toBe("CUSTOMER_ALREADY_CLAIMED");
    });

    it("does not create invite for a customer whose activation is migrating", async () => {
        await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .set({
                userId: "firebase-user-001",
                institutionId: "ins-a",
                pilotId: "pilot-001",
                status: PILOT_IDENTITY_STATUSES.MIGRATING,
            });

        const result = await createInvites({
            customers: [
                {
                    rawCustomerId: "CUST-001",
                    importCustomerId: "import-customer-001",
                },
            ],
            institutionId: "ins-a",
            pilotId: "pilot-001",
            importId: "import-001",
            activationBaseUrl: "https://smartbudget.app",
        });

        const invites = await db.collection("invites").get();

        expect(invites.size).toBe(0);
        expect(result.inviteExports).toHaveLength(0);
        expect(result.skippedInvites[0].reason).toBe("CUSTOMER_ALREADY_CLAIMED");
    });
});
