import { describe, expect, it } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { createInvites } from "../createInvites.js";
import { INVITE_STATUSES } from "../inviteTypes.js";
import { validateInvite } from "../validateInvite.js";

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

    return {
        token,
        inviteExport: result.inviteExports[0],
    };
};

describe("validateInvite()", () => {
    it("returns scope for an active unexpired invite", async () => {
        const { token } = await createInviteAndToken();

        const result = await validateInvite({ token });

        expect(result).toMatchObject({
            importCustomerId: "import-customer-001",
            institutionId: "ins-a",
            pilotId: "pilot-001",
            cohortId: null,
        });
    });

    it("marks expired active invite as expired", async () => {
        const { token } = await createInviteAndToken({
            ttlDays: -1,
        });

        await expect(validateInvite({ token })).rejects.toThrow(
            "INVITE_EXPIRED"
        );

        const invites = await db.collection("invites").get();
        const invite = invites.docs[0].data();

        const state = await db
            .collection("pilotInviteStates")
            .doc("import-customer-001")
            .get();

        expect(invite.status).toBe(INVITE_STATUSES.EXPIRED);
        expect(state.data().status).toBe(INVITE_STATUSES.EXPIRED);
    });

    it("rejects a used invite", async () => {
        const { token } = await createInviteAndToken();

        const invites = await db.collection("invites").get();

        await invites.docs[0].ref.update({
            status: INVITE_STATUSES.USED,
            usedByUserId: "firebase-user-001",
        });

        await expect(validateInvite({ token })).rejects.toThrow(
            "INVITE_NOT_ACTIVE"
        );
    });
});
