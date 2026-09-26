import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import PWAInstallBanner from "./PWAInstallBanner";
import PWAInstallDialog from "./PWAInstallDialog";
import { isAppleMobileDevice, isRunningStandalone } from "./pwaDetection";

export const PWAInstallPrompt = () => {
  const [installEvent, setInstallEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIosPromptDismissed, setIsIosPromptDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isIOS] = useState(isAppleMobileDevice);
  const [isStandalone, setIsStandalone] = useState(isRunningStandalone);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsDialogOpen(false);
      setIsStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const requiresIosInstructions = isIOS && !isStandalone && !installEvent;
  const shouldShowBanner =
    Boolean(installEvent) || (requiresIosInstructions && !isIosPromptDismissed);

  const dismiss = () => {
    setIsDialogOpen(false);
    if (requiresIosInstructions) setIsIosPromptDismissed(true);
    else setInstallEvent(null);
  };

  const install = async () => {
    if (!installEvent || installing) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
      setIsDialogOpen(false);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {shouldShowBanner && !isDialogOpen && (
          <PWAInstallBanner
            requiresIosInstructions={requiresIosInstructions}
            onOpen={() => setIsDialogOpen(true)}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>
      <PWAInstallDialog
        open={isDialogOpen}
        requiresIosInstructions={requiresIosInstructions}
        installing={installing}
        onClose={dismiss}
        onInstall={install}
      />
    </>
  );
};
