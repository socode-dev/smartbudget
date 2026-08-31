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

export const activateInviteToken = async ({ token, idToken }) => {
    const response = await fetch("/api/invites/activate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, idToken }),
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