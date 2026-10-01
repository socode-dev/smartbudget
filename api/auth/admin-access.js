import { syncAdminAccess } from "../../backend/auth/adminAccess.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            error: {
                code: "METHOD_NOT_ALLOWED",
                message: "Only POST requests are supported.",
            },
        });
    }

    try {
        const result = await syncAdminAccess(req);

        if (!result.ok) {
            return res.status(result.status).json({
                ok: false,
                error: result.error,
            });
        }

        return res.status(200).json({
            ok: true,
            admin: result.admin,
            reason: result.reason,
        });
    } catch {
        return res.status(500).json({
            ok: false,
            error: {
                code: "ADMIN_ACCESS_SYNC_FAILED",
                message: "Admin access could not be synchronized.",
            },
        });
    }
}
