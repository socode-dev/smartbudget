import { describe, expect, it } from "vitest";

import { parseCsv } from "../parseCsv.js";

describe("parseCsv()", () => {
    it("normalizes headers and trims values", async () => {
        const csv = `
            Customer_ID , NAME , EMAIL
            CUST-001 , Samuel Oso , SAMUEL@example.com
        `;

        const result = await parseCsv({
            fileContent: csv,
        });

        expect(result.rows).toEqual([
            {
                customer_id: "CUST-001",
                name: "Samuel Oso",
                email: "SAMUEL@example.com",
            },
        ]);
    });
});