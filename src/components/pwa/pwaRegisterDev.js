import { useState } from "react";

// Vercel dev does not expose vite-plugin-pwa virtual modules. PWA registration
// remains active in production, while the development update prompt stays inert.
export const useRegisterSW = () => {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [offlineReady, setOfflineReady] = useState(false);

    return {
        needRefresh: [needRefresh, setNeedRefresh],
        offlineReady: [offlineReady, setOfflineReady],
        updateServiceWorker: async () => {},
    };
};
