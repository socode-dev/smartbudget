import { adminAuth } from "../../lib/firebaseAdmin.js";
import { getBearerToken } from "./requireAdmin.js";

export const requireUser = async (req, expectedUid = null) => {
    const idToken = getBearerToken(req);

    if (!idToken) {
        return {
            ok: false,
            status: 401,
            error: {
                code: "AUTH_REQUIRED",
                message: "A Firebase ID token is required.",
            },
        };
    }

    let decodedToken;

    try {
        decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch {
        return {
            ok: false,
            status: 401,
            error: {
                code: "AUTH_INVALID",
                message: "The Firebase ID token is invalid or expired.",
            },
        };
    }

    if (expectedUid && decodedToken.uid !== expectedUid) {
        return {
            ok: false,
            status: 403,
            error: {
                code: "USER_SCOPE_FORBIDDEN",
                message: "You are not authorized to access this user scope.",
            },
        };
    }

    return {
        ok: true,
        uid: decodedToken.uid,
        claims: decodedToken,
    };
};

export const sendUserAuthError = (res, authResult) => res.status(authResult.status).json({
    ok: false,
    error: authResult.error,
});
