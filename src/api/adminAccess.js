import { auth } from "../firebase/firebase";

export const syncAdminAccess = async () => {
    const user = auth.currentUser;

    if (!user) throw new Error("AUTH_REQUIRED");

    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/admin-access", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    const body = await response.json().catch(() => null);

    if (!response.ok || body?.ok !== true) {
        const error = new Error(body?.error?.code || "ADMIN_ACCESS_SYNC_FAILED");
        error.status = response.status;
        throw error;
    }

    if (body.admin === true) {
        await user.getIdToken(true);
    }

    return body;
};
