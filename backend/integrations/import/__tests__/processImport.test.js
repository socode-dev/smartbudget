import { describe, expect, it } from "vitest";
import { db } from "../../../../lib/firebaseAdmin.js";
import {
    IMPORT_FILE_TYPES,
    IMPORT_STATUSES
} from "../importTypes.js";
import { processImport } from "../processImport.js";
import { readFixture } from "./helpers/readFixture.js";

const SECRET = "smartbudget-test-secret";
const SCOPE = {
    institutionId: "bank-a",
    pilotId: "pilot-001",
    hmacSecret: SECRET,
    activationBaseUrl: "https://smartbudget.app",
};

describe("processImport()", () => {
    it("processes customers before transaction files can attach data", async () => {
        const customerCsv = await readFixture("customers.valid.csv");

        const customerImport = await processImport({
            ...SCOPE,
            fileName: "customers.valid.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
            fileContent: customerCsv,
        });

        expect(customerImport.ok).toBe(true);
        expect(customerImport.status).toBe(IMPORT_STATUSES.PROCESSED);
        expect(customerImport.acceptedRows).toBe(3);

        const transactionCsv = await readFixture("transactions.valid.csv");

        const transactionImport = await processImport({
            ...SCOPE,
            fileName: "transactions.valid.csv",
            fileType: IMPORT_FILE_TYPES.TRANSACTIONS,
            fileContent: transactionCsv,
        });

        expect(transactionImport.ok).toBe(true);
        expect(transactionImport.status).toBe(IMPORT_STATUSES.PROCESSED);
        expect(transactionImport.acceptedRows).toBe(6);
        expect(transactionImport.rejectedRows).toBe(0);
    });

    it("fails validation without writing malformed customer rows", async () => {
        const csv = await readFixture("customers.invalid.csv");

        const result = await processImport({
            ...SCOPE,
            fileName: "customers.invalid.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
            fileContent: csv,
        });

        expect(result.ok).toBe(false);
        expect(result.status).toBe(IMPORT_STATUSES.FAILED_VALIDATION);
        expect(result.errors.length).toBeGreaterThan(0);

        const users = await db.collection("users").get();

        expect(users.size).toBe(0);
    });

    it("skips duplicate files by content hash", async () => {
        const csv = await readFixture("customers.valid.csv");

        const first = await processImport({
            ...SCOPE,
            fileName: "customers.valid.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
            fileContent: csv,
        });

        const second = await processImport({
            ...SCOPE,
            fileName: "customers.valid-copy.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
            fileContent: csv,
        });

        expect(first.status).toBe(IMPORT_STATUSES.PROCESSED);
        expect(second.status).toBe(IMPORT_STATUSES.SKIPPED_DUPLICATE_FILE);
        expect(second.duplicateOf).toBe(first.importId);
    });

    it("does not treat a failed validation import as a processed duplicate", async () => {
        const csv = await readFixture("customers.invalid.csv");

        const first = await processImport({
            ...SCOPE,
            fileName: "customers.invalid.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
            fileContent: csv,
        });

        const second = await processImport({
            ...SCOPE,
            fileName: "customers.invalid-again.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
            fileContent: csv,
        });

        expect(first.status).toBe(IMPORT_STATUSES.FAILED_VALIDATION);
        expect(second.status).toBe(IMPORT_STATUSES.FAILED_VALIDATION);
    });

    it("rejects unsupported file extensions", async () => {
        await expect(
            processImport({
                ...SCOPE,
                fileName: "customers.txt",
                fileType: IMPORT_FILE_TYPES.CUSTOMERS,
                fileContent: "customer_id,name,email\nCUST-001,Samuel Oso,samuel@example.com",
            })
        ).rejects.toMatchObject({
            code: "UNSUPPORTED_FILE_EXTENSION",
        });
    });
});
