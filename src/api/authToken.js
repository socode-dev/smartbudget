import { auth } from "../firebase/firebase";

export const getCurrentUserIdToken = async () => {
    const user = auth.currentUser;

    if (!user) throw new Error("AUTH_REQUIRED");

    return user.getIdToken();
};

export const getAuthHeaders = async () => ({
    Authorization: `Bearer ${await getCurrentUserIdToken()}`,
});
