import { getAuthHeaders } from "./authToken";

export const validateInviteToken = async token => {
    const response = await fetch(
        `/api/invites/validate?token=${encodeURIComponent(token)}`
    );

    const payload = await response.json();

    if (!response.ok || !payload.ok) {
        const error = new Error(
            payload?.error?.message || "Activation link could not be validated."
        );

        error.code = payload?.error?.code;
        throw error;
    }

    return payload.invite;
}

export const activateInviteToken = async ({ token }) => {
    const response = await fetch("/api/invites/activate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ token }),
    });

    const payload = await response.json();

    if (!response.ok || !payload.ok) {
        const error = new Error(
            payload?.error?.message || "Activation could not be completed."
        );

        error.code = payload?.error?.code;
        throw error;
    }

    return payload.activation;
}
