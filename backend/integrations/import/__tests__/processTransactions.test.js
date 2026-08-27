import { describe, expect, it } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import { processCustomers } from "../processCustomers.js";
import { processTransactions } from "../processTransactions.js";
import { parseCsv } from "../parseCsv.js";
import { readFixture } from "./helpers/readFixture.js";
import { normalizeCustomerId } from "../normalizeIdentity.js";
import { PILOT_IDENTITY_STATUSES } from "../../invites/inviteTypes.js";

const SECRET = "smartbudget-test-secret";
const SCOPE = {
    institutionId: "bank-a",
    pilotId: "pilot-001",
    source: "sftp",
    hmacSecret: SECRET,
    activationBaseUrl: "https://smartbudget.app",
};

const importCustomers = async () => {
    const customersCsv = await readFixture("customers.valid.csv");
    const customers = await parseCsv({ fileContent: customersCsv });

    return processCustomers({
        rows: customers.rows,
        importId: "customers-import",
        ...SCOPE,
    });
};

const parseFixture = async filename => {
    const csv = await readFixture(filename);

    return parseCsv({ fileContent: csv });
};

describe("Incremental imports", () => {
    it("imports transactions for existing imported customers", async () => {
        await importCustomers();
        const first = await parseFixture("transactions.valid.csv");

        const result = await processTransactions({
            rows: first.rows,
            importId: "transactions-import-1",
            ...SCOPE,
        });

        expect(result.acceptedRows).toBe(6);
        expect(result.duplicateRows).toBe(0);
        expect(result.rejectedRows).toBe(0);

        const pilotCustomers = await db.collection("pilotCustomers").get();
        const counts = await Promise.all(
            pilotCustomers.docs.map(doc =>
                doc.ref.collection("transactions").get()
            )
        );

        expect(
            counts.reduce((total, snapshot) => total + snapshot.size, 0)
        ).toBe(6);
    });

    it("imports only new transactions", async () => {
        await importCustomers();
        const first = await parseFixture("transactions.valid.csv");
        
        await processTransactions({
            rows: first.rows,
            importId: "transactions-import-1",
            ...SCOPE,
        });

        const incremental = await parseFixture("transactions.incremental.csv");

        const result = await processTransactions({
            rows: incremental.rows,
            importId: "transactions-import-2",
            ...SCOPE,
        });

        expect(result.acceptedRows).toBe(2);
        expect(result.duplicateRows).toBe(1);
        expect(result.rejectedRows).toBe(0);

        const pilotCustomers = await db.collection("pilotCustomers").get();

        const customerWithThreeTransactions = await Promise.all(
            pilotCustomers.docs.map(async doc => ({
                ref: doc.ref,
                transactions: await doc.ref.collection("transactions").get(),
            }))
        );

        const match = customerWithThreeTransactions.find(
            item => item.transactions.size === 3
        );

        expect(match).toBeDefined();
    });

    it("rejects transactions for unknown customers", async () => {
        const unknownCustomer =
            await parseFixture("transactions.unknown-customer.csv");

        const result = await processTransactions({
            rows: unknownCustomer.rows,
            importId: "transactions-import-unknown",
            ...SCOPE,
        });

        expect(result.acceptedRows).toBe(0);
        expect(result.duplicateRows).toBe(0);
        expect(result.rejectedRows).toBe(1);
        expect(result.affectedUserIds).toEqual([]);

        const users = await db.collection("users").get();

        expect(users.size).toBe(0);
    });

    it("does not reset activated customer status during transaction import", async () => {
        await importCustomers();

        const importCustomerId = normalizeCustomerId({
            institutionId: SCOPE.institutionId,
            customerId: "CUST-001",
            secret: SECRET,
        });

        await db.collection("pilotIdentities").doc(importCustomerId).set(
            {
                userId: "firebase-user-001",
                institutionId: SCOPE.institutionId,
                pilotId: SCOPE.pilotId,
                status: PILOT_IDENTITY_STATUSES.CLAIMED,
            },
            { merge: true }
        );

        await db.collection("users").doc("firebase-user-001").set(
            {
                userId: "firebase-user-001",
                status: "ACTIVE",
                pilot: {
                    status: "CLAIMED",
                },
            },
            { merge: true }
        );

        const first = await parseFixture("transactions.valid.csv");

        await processTransactions({
            rows: first.rows,
            importId: "transactions-import-1",
            ...SCOPE,
        });

        const user = await db.collection("users").doc("firebase-user-001").get();

        expect(user.data().status).toBe("ACTIVE");
        expect(user.data().pilot.status).toBe("CLAIMED");

        const transactions = await user.ref.collection("transactions").get();
        expect(transactions.size).toBeGreaterThan(0);
    });

    it("routes migrating customer transactions directly to the linked user", async () => {
        await importCustomers();

        const importCustomerId = normalizeCustomerId({
            institutionId: SCOPE.institutionId,
            customerId: "CUST-001",
            secret: SECRET,
        });

        await db.collection("pilotIdentities").doc(importCustomerId).set(
            {
                userId: "firebase-user-001",
                institutionId: SCOPE.institutionId,
                pilotId: SCOPE.pilotId,
                status: PILOT_IDENTITY_STATUSES.MIGRATING,
            },
            { merge: true }
        );

        const first = await parseFixture("transactions.valid.csv");

        const result = await processTransactions({
            rows: first.rows,
            importId: "transactions-import-1",
            ...SCOPE,
        });

        const userTransactions = await db
            .collection("users")
            .doc("firebase-user-001")
            .collection("transactions")
            .get();

        const stagedTransactions = await db
            .collection("pilotCustomers")
            .doc(importCustomerId)
            .collection("transactions")
            .get();

        expect(result.affectedUserIds).toEqual(["firebase-user-001"]);
        expect(userTransactions.size).toBe(2);
        expect(stagedTransactions.size).toBe(0);
    });
});
