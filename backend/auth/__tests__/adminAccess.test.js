import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/firebaseAdmin.js", () => ({
    adminAuth: {
        verifyIdToken: vi.fn(),
        getUser: vi.fn(),
        setCustomUserClaims: vi.fn(),
        revokeRefreshTokens: vi.fn(),
    },
}));

import { adminAuth } from "../../../lib/firebaseAdmin.js";
import {
    parseAdminUids,
    revokeAdminAccess,
    syncAdminAccess,
} from "../adminAccess.js";

describe("admin access provisioning", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("VYDRA_ADMIN_UIDS", "admin-1, admin-2, malformed uid, ,admin-3");
    });

    it("parses exact comma-separated UIDs and ignores malformed entries", () => {
        expect(parseAdminUids()).toEqual(
            new Set(["admin-1", "admin-2", "admin-3"]),
        );
    });

    it("grants admin to an allowlisted verified UID while preserving claims", async () => {
        adminAuth.verifyIdToken.mockResolvedValueOnce({
            uid: "admin-1",
            email: "admin@example.com",
            email_verified: true,
        });
        adminAuth.getUser.mockResolvedValueOnce({
            customClaims: {
                someOtherClaim: true,
                admin: false,
            },
        });

        await expect(
            syncAdminAccess({
                headers: { authorization: "Bearer admin-token" },
            }),
        ).resolves.toMatchObject({
            ok: true,
            admin: true,
            claimUpdated: true,
        });

        expect(adminAuth.setCustomUserClaims).toHaveBeenCalledWith("admin-1", {
            someOtherClaim: true,
            admin: true,
        });
    });

    it("does not mutate claims for a non-allowlisted UID", async () => {
        adminAuth.verifyIdToken.mockResolvedValueOnce({
            uid: "user-1",
            email: "user@example.com",
            email_verified: true,
        });

        await expect(
            syncAdminAccess({
                headers: { authorization: "Bearer user-token" },
            }),
        ).resolves.toMatchObject({
            ok: false,
            status: 403,
            error: { code: "ADMIN_UID_NOT_ALLOWLISTED" },
        });

        expect(adminAuth.getUser).not.toHaveBeenCalled();
        expect(adminAuth.setCustomUserClaims).not.toHaveBeenCalled();
    });

    it("requires email verification", async () => {
        adminAuth.verifyIdToken.mockResolvedValueOnce({
            uid: "admin-1",
            email: "admin@example.com",
            email_verified: false,
        });

        await expect(
            syncAdminAccess({
                headers: { authorization: "Bearer admin-token" },
            }),
        ).resolves.toMatchObject({
            ok: false,
            status: 403,
            error: { code: "EMAIL_VERIFICATION_REQUIRED" },
        });
    });

    it("rejects the known demo identity even when configured", async () => {
        vi.stubEnv("VYDRA_ADMIN_UIDS", "demo-mfb-customer");
        adminAuth.verifyIdToken.mockResolvedValueOnce({
            uid: "demo-mfb-customer",
            email: "demo@example.com",
            email_verified: true,
        });

        await expect(
            syncAdminAccess({
                headers: { authorization: "Bearer demo-token" },
            }),
        ).resolves.toMatchObject({
            ok: false,
            status: 403,
            error: { code: "DEMO_USER_FORBIDDEN" },
        });
    });

    it("removes only the admin claim and revokes refresh tokens", async () => {
        adminAuth.getUser.mockResolvedValueOnce({
            customClaims: {
                someOtherClaim: true,
                admin: true,
            },
        });

        await expect(revokeAdminAccess({ uid: "admin-1" })).resolves.toEqual({
            ok: true,
            uid: "admin-1",
            claimRemoved: true,
            refreshTokensRevoked: true,
        });

        expect(adminAuth.setCustomUserClaims).toHaveBeenCalledWith("admin-1", {
            someOtherClaim: true,
        });
        expect(adminAuth.revokeRefreshTokens).toHaveBeenCalledWith("admin-1");
    });
});
