import { describe, expect, it } from "vitest";

import {
    normalizeCustomerId,
    normalizeTransactionId,
} from "../normalizeIdentity.js";

const SECRET = "smartbudget-test-secret";

describe("normalizeCustomerId()", () => {
    it("returns deterministic IDs", () => {
        const id1 = normalizeCustomerId({
            institutionId: "bank-a",
            customerId: "CUST-001",
            secret: SECRET,
        });

        const id2 = normalizeCustomerId({
            institutionId: "bank-a",
            customerId: "CUST-001",
            secret: SECRET,
        });

        expect(id1).toBe(id2);
    });

    it("changes when institution changes", () => {
        const bankA = normalizeCustomerId({
            institutionId: "bank-a",
            customerId: "CUST-001",
            secret: SECRET,
        });

        const bankB = normalizeCustomerId({
            institutionId: "bank-b",
            customerId: "CUST-001",
            secret: SECRET,
        });

        expect(bankA).not.toBe(bankB);
    });
});

describe("normalizeTransactionId()", () => {
    it("returns deterministic transaction IDs", () => {
        const id1 = normalizeTransactionId({
            institutionId: "bank-a",
            transactionId: "TXN-001",
            secret: SECRET,
        });

        const id2 = normalizeTransactionId({
            institutionId: "bank-a",
            transactionId: "TXN-001",
            secret: SECRET,
        });

        expect(id1).toBe(id2);
    });
});