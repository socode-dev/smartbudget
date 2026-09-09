import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInvitationDeliverySpool } from "../deliverySpool.js";
import { retryInvitationDeliverySpools } from "../retryDeliverySpool.js";

const previousKey = process.env.SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY;

beforeEach(() => {
    process.env.SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
});

afterEach(() => {
    if (previousKey === undefined) {
        delete process.env
            .SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY;
    } else {
        process.env.SFTP_DELIVERY_SPOOL_ENCRYPTION_KEY =
            previousKey;
    }
});

describe("retryInvitationDeliverySpools()", () => {
    it("returns a numeric failed count", async () => {
        await createInvitationDeliverySpool({
            institutionId: "institution-a",
            pilotId: "pilot-1",
            importId: "import-1",
            fileName: "customers.csv",
            batchId: "batch-1",
            invitationFileName: "invitations.csv",
            invitationCsv:
                "customer_id,activation_link\ncustomer-1,url",
        });

        const client = {
            exists: vi.fn().mockResolvedValue(true),
            mkdir: vi.fn(),
            put: vi.fn().mockRejectedValue(
                Object.assign(
                    new Error("Upload failed"),
                    { code: "UPLOAD_FAILED" },
                ),
            ),
        };

        const result =
            await retryInvitationDeliverySpools({
                client,
                institutionId: "institution-a",
                pilotId: "pilot-1",
                outgoingDir: "/outgoing",
            });

        expect(result.ok).toBe(false);
        expect(result.checkedCount).toBe(1);
        expect(result.deliveredCount).toBe(0);
        expect(result.failedCount).toBe(1);
        expect(Array.isArray(result.failedCount))
            .toBe(false);
    });
});