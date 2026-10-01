import { adminAuth } from "../../lib/firebaseAdmin.js";

export const ADMIN_CLAIM = "admin";

export const getBearerToken = req => {
    const authorization = req?.headers?.authorization ?? req?.headers?.Authorization;

    if (!authorization || typeof authorization !== "string") return null;

    const [scheme, token] = authorization.trim().split(/\s+/);

    if (scheme?.toLowerCase() !== "bearer" || !token) return null;

    return token;
};

export const requireAdmin = async req => {
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

    if (decodedToken?.[ADMIN_CLAIM] !== true) {
        return {
            ok: false,
            status: 403,
            error: {
                code: "ADMIN_REQUIRED",
                message: "Admin authorization is required.",
            },
        };
    }

    if (decodedToken.email_verified !== true) {
        return {
            ok: false,
            status: 403,
            error: {
                code: "EMAIL_VERIFICATION_REQUIRED",
                message: "Verify your email address before using Admin access.",
            },
        };
    }

    return {
        ok: true,
        uid: decodedToken.uid,
        claims: decodedToken,
    };
};

export const sendAdminAuthError = (res, authResult) => {
    return res.status(authResult.status).json({
        ok: false,
        error: authResult.error,
    });
};
