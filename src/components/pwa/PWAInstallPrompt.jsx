import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const PWAInstallPrompt = () => {
    const [installEvent, setInstallEvent] = useState(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();

            setInstallEvent(event);
        };

        const handleAppInstalled = () => {
            setInstallEvent(null);
            setIsDialogOpen(false);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const shouldShowBanner = Boolean(installEvent);

    const openInstallDialog = () => setIsDialogOpen(true);

    const closeInstallDialog = () => {
        setIsDialogOpen(false);
        setInstallEvent(null);
    };

    const dismissBanner = () => setInstallEvent(null);

    const handleRealInstall = async () => {
        if (!installEvent) {
            return;
        }

        await installEvent.prompt();

        setInstallEvent(null);
        setIsDialogOpen(false);
    };

    return (
    <AnimatePresence mode="wait">
        {shouldShowBanner && !isDialogOpen && (
            <motion.div
                key="pwa-install-banner"
                initial={{ opacity: 0, x: 56 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 56 }}
                transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 30,
                    mass: 0.8,
                }}
                className="fixed bottom-4 right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-lg border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] p-4 shadow-xl"
            >
                
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--color-status-bg-blue))] bg-[rgb(var(--color-status-bg-blue))]">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5 text-[rgb(var(--color-brand))]"
                            aria-hidden="true"
                        >
                            <path
                            d="M12 3v12"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            />

                            <path
                            d="m7.5 10.5 4.5 4.5 4.5-4.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            />

                            <path
                            d="M5 21h14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[rgb(var(--color-text))]">
                            Install SmartBudget
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[rgb(var(--color-muted))]">
                            Add SmartBudget to this device for faster access and a standalone
                            app experience.
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={openInstallDialog}
                                className="rounded-md bg-[rgb(var(--color-brand))] px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-[rgb(var(--color-brand-hover))] active:scale-103 cursor-pointer"
                            >
                                Install SmartBudget
                            </button>

                            <button
                                type="button"
                                onClick={dismissBanner}
                                className="rounded-md border border-[rgb(var(--color-gray-border))] px-4 py-2 text-sm font-medium text-[rgb(var(--color-muted))] transition hover:bg-[rgb(var(--color-gray-bg))] cursor-pointer"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}


        {isDialogOpen && (
            <motion.div
                key="pwa-install-dialog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pwa-install-title"
                className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 30,
                        mass: 0.85,
                    }}
                    className="w-full max-w-md rounded-lg border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] p-6 shadow-2xl"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--color-status-bg-blue))] bg-[rgb(var(--color-status-bg-blue))]">
                            <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-6 w-6 text-[rgb(var(--color-brand))]"
                            aria-hidden="true"
                            >
                                <path
                                    d="M12 3v11"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />

                                <path
                                    d="m7.5 10 4.5 4.5 4.5-4.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                <path
                                    d="M5 18v2h14v-2"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <div className="min-w-0">
                            <h2
                            id="pwa-install-title"
                            className="text-lg font-semibold text-[rgb(var(--color-text))]"
                            >
                            Install SmartBudget
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[rgb(var(--color-muted))]">
                            Install SmartBudget on this device for quick access and a more
                            focused application experience.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex gap-3">
                            <CheckIcon />

                            <div>
                                <p className="text-sm font-medium text-[rgb(var(--color-text))]">Faster access</p>

                                <p className="mt-0.5 text-sm text-[rgb(var(--color-muted))]">
                                    Launch SmartBudget directly from your desktop or application launcher.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <CheckIcon />

                            <div>
                                <p className="text-sm font-medium text-[rgb(var(--color-text))]">Standalone experience</p>

                                <p className="mt-0.5 text-sm text-[rgb(var(--color-muted))]">
                                Use SmartBudget in its own application window without normal browser navigation.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <CheckIcon />

                            <div>
                                <p className="text-sm font-medium text-[rgb(var(--color-text))]">Always within reach</p>

                                <p className="mt-0.5 text-sm text-[rgb(var(--color-muted))]">
                                Keep your financial workspace available alongside your other applications.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeInstallDialog}
                            className="rounded-md border border-[rgb(var(--color-gray-border))] px-4 py-2 text-sm font-medium text-[rgb(var(--color-muted))] transition hover:bg-[rgb(var(--color-gray-bg))] cursor-pointer"
                        >
                            Not now
                        </button>

                        <button
                            type="button"
                            onClick={handleRealInstall}
                            className="rounded-md bg-[rgb(var(--color-brand))] px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-[rgb(var(--color-brand-hover))] active:scale-103 cursor-pointer"
                        >
                            Install SmartBudget
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}

const CheckIcon = () => {
    return (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-status-bg-blue))] text-[rgb(var(--color-brand))]">
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path
            d="m6 10 2.5 2.5L14 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
        </svg>
        </div>
    );
}
