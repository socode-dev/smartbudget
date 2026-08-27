import { describe, expect, it } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { processCustomers } from "../processCustomers.js";
import { readFixture } from "./helpers/readFixture.js";
import { parseCsv } from "../parseCsv.js";
import { normalizeCustomerId } from "../normalizeIdentity.js";
import { PILOT_IDENTITY_STATUSES } from "../../invites/inviteTypes.js";

const SECRET = "smartbudget-test-secret";
const ACTIVATION_BASE_URL = "https://smartbudget.app";

describe("processCustomers()", () => {
    it("creates pilot customers and invite exports from customers.csv", async () => {
        const csv = await readFixture("customers.valid.csv");

        const parsed = await parseCsv({
            fileContent: csv,
        });

        const result = await processCustomers({
            rows: parsed.rows,

            institutionId: "bank-a",

            pilotId: "pilot-001",

            source: "sftp",

            importId: "import-001",

            hmacSecret: SECRET,

            activationBaseUrl: ACTIVATION_BASE_URL,
        });

        expect(result.acceptedRows).toBe(3);
        expect(result.inviteExports).toHaveLength(3);
        expect(result.inviteExports[0]).toEqual({
            customer_id: "CUST-001",
            activation_link: expect.stringContaining("/activate?token="),
        });

        const users = await db.collection("users").get();
        expect(users.size).toBe(0);

        const pilotCustomers = await db.collection("pilotCustomers").get();
        expect(pilotCustomers.size).toBe(3);

        const stored = JSON.stringify(
            pilotCustomers.docs.map(doc => doc.data())
        );

        expect(stored).not.toContain("CUST-001");
        expect(stored).not.toContain("CUST-002");
        expect(stored).not.toContain("CUST-003");
    });

    it("does not create duplicate pilot customers or active invites on re-import", async () => {
        const csv = await readFixture("customers.valid.csv");

        const parsed = await parseCsv({
            fileContent: csv,
        });

        await processCustomers({
            rows: parsed.rows,

            institutionId: "bank-a",

            pilotId: "pilot-001",

            source: "sftp",

            importId: "import-001",

            hmacSecret: SECRET,

            activationBaseUrl: ACTIVATION_BASE_URL,
        });

        await processCustomers({
            rows: parsed.rows,

            institutionId: "bank-a",

            pilotId: "pilot-001",

            source: "sftp",

            importId: "import-002",

            hmacSecret: SECRET,

            activationBaseUrl: ACTIVATION_BASE_URL,
        });

        const users = await db.collection("users").get();

        expect(users.size).toBe(0);

        const pilotCustomers = await db.collection("pilotCustomers").get();
        expect(pilotCustomers.size).toBe(3);

        const invites = await db.collection("invites").get();
        expect(invites.size).toBe(3);
    });

    it("skips customers whose activation is already migrating", async () => {
        const csv = await readFixture("customers.valid.csv");

        const parsed = await parseCsv({
            fileContent: csv,
        });

        const importCustomerId = normalizeCustomerId({
            institutionId: "bank-a",
            customerId: "CUST-001",
            secret: SECRET,
        });

        await db
            .collection("pilotIdentities")
            .doc(importCustomerId)
            .set({
                importCustomerId,
                userId: "firebase-user-001",
                institutionId: "bank-a",
                pilotId: "pilot-001",
                status: PILOT_IDENTITY_STATUSES.MIGRATING,
            });

        const result = await processCustomers({
            rows: parsed.rows,

            institutionId: "bank-a",

            pilotId: "pilot-001",

            source: "sftp",

            importId: "import-001",

            hmacSecret: SECRET,

            activationBaseUrl: ACTIVATION_BASE_URL,
        });

        expect(result.acceptedRows).toBe(3);
        expect(result.skippedRows).toBe(1);
        expect(result.skippedClaimedImportCustomerIds).toEqual([
            importCustomerId,
        ]);
        expect(result.inviteExports).toHaveLength(2);
    });
});
