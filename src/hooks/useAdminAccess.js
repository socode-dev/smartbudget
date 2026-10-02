import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { syncAdminAccess } from "../api/adminAccess";
import useAuthStore from "../store/useAuthStore";

const useAdminAccess = () => {
    const userId = useAuthStore(state => state.currentUser?.uid);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const resolveAccess = async () => {
            setIsAdmin(false);

            const authUser = auth.currentUser;
            if (!userId || !authUser || authUser.uid !== userId) {
                return;
            }

            try {
                let tokenResult = await authUser.getIdTokenResult();

                if (tokenResult.claims.admin === true) {
                    if (!cancelled) setIsAdmin(true);
                    return;
                }

                const access = await syncAdminAccess();
                if (access.admin !== true) return;
                tokenResult = await authUser.getIdTokenResult(true);

                if (!cancelled) {
                    setIsAdmin(tokenResult.claims.admin === true);
                }
            } catch {
                if (!cancelled) setIsAdmin(false);
            }
        };

        void resolveAccess();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    return isAdmin;
};

export default useAdminAccess;
