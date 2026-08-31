import { validateInvite } from "../../backend/integrations/invites/validateInvite.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            ok: false,
            error: {
                code: "METHOD_NOT_ALLOWED",
                message: "Request failed. Please try again.",
            },
        });
    }

    const token = String(req.query?.token ?? "").trim();

    if (!token) {
        return res.status(400).json({
            ok: false,
            error: {
                code: "MISSING_INVITE_TOKEN",
                message: "Activation link is missing its invite token.",
            },
        });
    }

    try {
        const invite = await validateInvite({ token });

        return res.status(200).json({
            ok: true,
            invite: {
                institutionId: invite.institutionId,
                pilotId: invite.pilotId,
                cohortId: invite.cohortId,
                expiresAtMs: invite.expiresAtMs,
            },
        });
    } catch (err) {
        const code = err.message || "INVITE_VALIDATION_FAILED";

        const statusByCode = {
            INVITE_NOT_FOUND: 404,
            INVITE_EXPIRED: 410,
            INVITE_NOT_ACTIVE: 409,
            MISSING_INVITE_TOKEN: 400,
        };

        return res.status(statusByCode[code] ?? 500).json({
            ok: false,
            error: {
                code,
                message: getInviteValidationMessage(code),
            },
        });
    }
}

const getInviteValidationMessage = code => {
    switch (code) {
        case "INVITE_NOT_FOUND":
            return "This activation link is not valid.";
        case "INVITE_EXPIRED":
            return "This activation link has expired.";
        case "INVITE_NOT_ACTIVE":
            return "This activation link has already been used or is no longer active.";
        default:
            return "We could not validate this activation link.";
    }
}