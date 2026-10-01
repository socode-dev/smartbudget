import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/firebaseAdmin.js", () => ({
    adminAuth: {
        verifyIdToken: vi.fn(),
    },
}));

import { adminAuth } from "../../../lib/firebaseAdmin.js";
import { requireAdmin } from "../requireAdmin.js";

describe("requireAdmin", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("requires a bearer token", async () => {
        await expect(requireAdmin({ headers: {} })).resolves.toMatchObject({
            ok: false,
            status: 401,
            error: { code: "AUTH_REQUIRED" },
        });

        expect(adminAuth.verifyIdToken).not.toHaveBeenCalled();
    });

    it("rejects invalid tokens", async () => {
        adminAuth.verifyIdToken.mockRejectedValueOnce(new Error("invalid"));

        await expect(requireAdmin({
            headers: { authorization: "Bearer invalid-token" },
        })).resolves.toMatchObject({
            ok: false,
            status: 401,
            error: { code: "AUTH_INVALID" },
        });
    });

    it("rejects authenticated non-admin users", async () => {
        adminAuth.verifyIdToken.mockResolvedValueOnce({
            uid: "user-1",
            admin: false,
        });

        await expect(requireAdmin({
            headers: { authorization: "Bearer user-token" },
        })).resolves.toMatchObject({
            ok: false,
            status: 403,
            error: { code: "ADMIN_REQUIRED" },
        });
    });

    it("returns the verified admin UID and claims", async () => {
        const claims = {
            uid: "admin-1",
            admin: true,
            email: "admin@vydra.app",
            email_verified: true,
        };
        adminAuth.verifyIdToken.mockResolvedValueOnce(claims);

        await expect(requireAdmin({
            headers: { Authorization: "Bearer admin-token" },
        })).resolves.toEqual({
            ok: true,
            uid: "admin-1",
            claims,
        });

        expect(adminAuth.verifyIdToken).toHaveBeenCalledWith("admin-token", true);
    });
});
