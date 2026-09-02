import { useRegisterSW } from "virtual:pwa-register/react";
import { AnimatePresence, motion } from "framer-motion";

export const PWAUpdatePrompt = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        offlineReady: [, setOfflineReady],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, registration) {
            if (import.meta.env.DEV) {
                console.log("Service worker registered:", swUrl, registration);
            }
        },

        onRegisterError(error) {
            console.error("Service worker registration failed:", error);
        },
    });

    const closeDialog = () => {
        setNeedRefresh(false);
        setOfflineReady(false);
    };

    const handleUpdate = async () => {
        await updateServiceWorker(true);
    };

    return (
        <AnimatePresence>
        {needRefresh && (
        <motion.div
            key="pwa-update-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-update-title"
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 30,
                    mass: 0.8,
                }}
                className="w-full max-w-md rounded-lg border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] p-6 shadow-2xl"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--color-status-bg-blue))] bg-[rgb(var(--color-status-bg-blue))]">
                        <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5 text-[rgb(var(--color-brand))]"
                        aria-hidden="true"
                        >
                            <path
                                d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <path
                                d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="min-w-0">
                        <h2
                            id="pwa-update-title"
                            className="text-lg font-semibold text-[rgb(var(--color-text))]"
                        >
                            SmartBudget update available
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[rgb(var(--color-muted))]">
                            A newer version of SmartBudget is available. Update when you are ready to use the latest improvements.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={closeDialog}
                        className="rounded-md border border-[rgb(var(--color-gray-border))] px-4 py-2 text-sm font-medium text-[rgb(var(--color-muted))] transition hover:bg-[rgb(var(--color-gray-bg))] cursor-pointer"
                    >
                        Later
                    </button>

                    <button
                        type="button"
                        onClick={handleUpdate}
                        className="rounded-md bg-[rgb(var(--color-brand))] px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-[rgb(var(--color-brand-hover))] active:scale-103 cursor-pointer"
                    >
                        Update now
                    </button>
                </div>
            </motion.div>
        </motion.div>
        )}
        </AnimatePresence>
    );
};
