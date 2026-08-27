import { describe, expect, it } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { createInvites, hashInviteToken } from "../createInvites.js"

describe("createInvites()", () => {
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

    it("does not create invite for claimed customer", async () => {
        await db
            .collection("pilotIdentities")
            .doc("import-customer-001")
            .set({
                userId: "firebase-user-001",
                institutionId: "ins-a",
                pilotId: "pilot-001",
                status: "CLAIMED",
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