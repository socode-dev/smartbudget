import { describe, expect, it } from "vitest";
import { IMPORT_FILE_TYPES } from "../importTypes.js";
import { parseCsv } from "../parseCsv.js";
import { validateCsv } from "../validateCsv.js";
import { readFixture } from "./helpers/readFixture.js";

const validateFixture = async ({ filename, fileType }) => {
    const csv = await readFixture(filename);
    const parsed = parseCsv({ fileContent: csv });

    return validateCsv({
        rows: parsed.rows,
        fileType,
    });
};

describe("validateCsv()", () => {
    it("accepts valid customer files", async () => {
        const errors = await validateFixture({
            filename: "customers.valid.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
        });

        expect(errors).toEqual([]);
    });

    it("rejects customer rows with missing identity or name", async () => {
        const errors = await validateFixture({
            filename: "customers.invalid.csv",
            fileType: IMPORT_FILE_TYPES.CUSTOMERS,
        });

        expect(errors.map(error => error.code)).toEqual([
            "MISSING_REQUIRED_VALUE",
            "MISSING_REQUIRED_VALUE",
        ]);
    });

    it("accepts valid transaction files", async () => {
        const errors = await validateFixture({
            filename: "transactions.valid.csv",
            fileType: IMPORT_FILE_TYPES.TRANSACTIONS,
        });

        expect(errors).toEqual([]);
    });

    it("rejects malformed transaction rows", async () => {
        const errors = await validateFixture({
            filename: "transactions.invalid.csv",
            fileType: IMPORT_FILE_TYPES.TRANSACTIONS,
        });

        expect(errors.map(error => error.code)).toEqual([
            "MISSING_REQUIRED_VALUE",
            "MISSING_REQUIRED_VALUE",
            "INVALID_TRANSACTION_TYPE",
            "INVALID_AMOUNT",
            "INVALID_DATE",
        ]);
    });
});
