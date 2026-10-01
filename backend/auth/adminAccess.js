import { adminAuth } from "../../lib/firebaseAdmin.js";
import { getBearerToken } from "./requireAdmin.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export const ADMIN_UIDS_ENV = "VYDRA_ADMIN_UIDS";
export const DEMO_USER_UID = "demo-mfb-customer";

const isValidConfiguredUid = value =>
    typeof value === "string"
    && value.length > 0
    && value.length <= 128
    && !/\s/.test(value);

export const parseAdminUids = (value = process.env[ADMIN_UIDS_ENV]) =>
    new Set(
        String(value || "")
            .split(",")
            .map(uid => uid.trim())
            .filter(isValidConfiguredUid),
    );

const authError = (status, code, message) => ({
    ok: false,
    status,
    error: { code, message },
});

export const syncAdminAccess = async req => {
    const idToken = getBearerToken(req);

    if (!idToken) {
        return authError(401, "AUTH_REQUIRED", "A Firebase ID token is required.");
    }

    let decodedToken;

    try {
        decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch {
        return authError(401, "AUTH_INVALID", "The Firebase ID token is invalid or expired.");
    }

    if (!decodedToken.uid || !decodedToken.email) {
        return authError(
            403,
            "ADMIN_IDENTITY_REQUIRED",
            "A verified Firebase identity is required for Admin access.",
        );
    }

    if (decodedToken.uid === DEMO_USER_UID) {
        return authError(
            403,
            "DEMO_USER_FORBIDDEN",
            "Demo users cannot access the Admin Dashboard.",
        );
    }

    if (decodedToken.email_verified !== true) {
        return authError(
            403,
            "EMAIL_VERIFICATION_REQUIRED",
            "Verify your email address before requesting Admin access.",
        );
    }

    const allowlistedUids = parseAdminUids();
    const isAllowlisted = allowlistedUids.has(decodedToken.uid);

    if (!isAllowlisted) {
        return authError(
            403,
            allowlistedUids.size === 0
                ? "ADMIN_ALLOWLIST_NOT_CONFIGURED"
                : "ADMIN_UID_NOT_ALLOWLISTED",
            "This Firebase account is not provisioned for Admin access.",
        );
    }

    const userRecord = await adminAuth.getUser(decodedToken.uid);
    const currentClaims = userRecord.customClaims || {};
    const nextClaims = { ...currentClaims, admin: true };
    const claimUpdated = currentClaims.admin !== true;

    if (claimUpdated) {
        await adminAuth.setCustomUserClaims(decodedToken.uid, nextClaims);
    }

    return {
        ok: true,
        uid: decodedToken.uid,
        admin: true,
        claimUpdated,
        reason: claimUpdated ? "ADMIN_ACCESS_GRANTED" : "ADMIN_CLAIM_ALREADY_SET",
    };
};

export const revokeAdminAccess = async ({ uid, revokeRefreshTokens = true } = {}) => {
    if (!isValidConfiguredUid(uid)) throw new Error("INVALID_ADMIN_UID");

    const userRecord = await adminAuth.getUser(uid);
    const currentClaims = userRecord.customClaims || {};

    if (currentClaims.admin === true) {
        const nextClaims = { ...currentClaims };
        delete nextClaims.admin;
        await adminAuth.setCustomUserClaims(uid, nextClaims);
    }

    if (revokeRefreshTokens) {
        await adminAuth.revokeRefreshTokens(uid);
    }

    return {
        ok: true,
        uid,
        claimRemoved: currentClaims.admin === true,
        refreshTokensRevoked: revokeRefreshTokens,
    };
};
