import { adminAuth } from "../../lib/firebaseAdmin.js";
import { activateInvite } from "../../backend/integrations/invites/activateInvite.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            error: {
                code: "METHOD_NOT_ALLOWED",
                message: "Request failed. Please try again."
            },
        });
    }

    const { token, idToken } = req.body || {};

    if (!token || !idToken) {
        return res.status(400).json({
            ok: false,
            error: {
                code: "MISSING_ACTIVATION_PARAMS",
                message: "Activation request is incomplete.",
            },
        });
    }

    try {
        const decoded = await adminAuth.verifyIdToken(idToken);

        if (!decoded.uid) {
            return res.status(401).json({
                ok: false,
                error: {
                    code: "AUTH_UID_REQUIRED",
                    message: "Authentication could not be verified",
                },
            });
        }

        if (!decoded.email) {
            return res.status(400).json({
                ok: false,
                error: {
                    code: "AUTH_EMAIL_REQUIRED",
                    message: "The authenticated account must have an email address.",
                },
            });
        }

        const activation = await activateInvite({
            token,
            authUid: decoded.uid,
            email: decoded.email,
        });

        return res.status(200).json({
            ok: true,
            activation: {
                userId: activation.userId,
                institutionId: activation.institutionId,
                pilotId: activation.pilotId,
                cohortId: activation.cohortId ?? null,
                alreadyActivated: activation.alreadyActivated,
            },
        });
    } catch (err) {
        const code = err.message || err.code || "INVITE_ACTIVATION_FAILED";

        const statusByCode = {
            INVITE_NOT_FOUND: 404,
            INVITE_EXPIRED: 410,
            INVITE_NOT_ACTIVE: 409,
            INVITE_ALREADY_USED: 409,
            CUSTOMER_ALREADY_CLAIMED: 409,
            CUSTOMER_ACTIVATION_IN_PROGRESS: 409,
            AUTH_USER_ALREADY_LINKED: 409,
            TRANSACTION_MIGRATION_INCOMPLETE: 500,
        };

        return res.status(statusByCode[code] ?? 500).json({
            ok: false,
            error: {
                code,
                message: getActivationMessage(code),
            },
        });
    }
}

const getActivationMessage = code => {
    switch (code) {
        case "INVITE_NOT_FOUND":
            return "This activation link is not valid.";
        case "INVITE_EXPIRED":
            return "This activation link has expired.";
        case "INVITE_NOT_ACTIVE":
        case "INVITE_ALREADY_USED":
            return "This activation link has already been used or is no longer active.";
        case "CUSTOMER_ALREADY_CLAIMED":
            return "This institution customer has already activated SmartBudget.";
        case "CUSTOMER_ACTIVATION_IN_PROGRESS":
            return "Activation is already in progress. Please try again shortly.";
        case "AUTH_USER_ALREADY_LINKED":
            return "This signed-in account is already linked to another institution invite.";
        case "TRANSACTION_MIGRATION_INCOMPLETE":
            return "Activation started, but financial data migration did not finish. Please retry.";
        default:
            return "We could not complete activation. Please try again.";
    }
};