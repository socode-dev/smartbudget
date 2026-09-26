import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useRegisterSW } from "virtual:pwa-register/react";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";

export const PWAUpdatePrompt = () => {
  const [updating, setUpdating] = useState(false);
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (import.meta.env.DEV)
        console.log("Service worker registered:", swUrl, registration);
    },
    onRegisterError(error) {
      console.error("Service worker registration failed:", error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  const update = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await updateServiceWorker(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog
      open={needRefresh}
      onClose={close}
      padded={false}
      ariaLabelledBy="pwa-update-title"
      ariaDescribedBy="pwa-update-description"
      className="max-w-md"
    >
      <div className="flex items-start gap-4 px-5 py-5 sm:px-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">
          <FiRefreshCw size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="pwa-update-title"
            className="font-display text-lg font-semibold"
          >
            Update Vydra
          </h2>
          <p
            id="pwa-update-description"
            className="mt-1 text-sm leading-6 text-muted-foreground"
          >
            A newer version is ready with the latest improvements and fixes.
          </p>
        </div>
      </div>
      <footer className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-5 py-4 sm:px-6">
        <Button variant="outline" onClick={close} disabled={updating}>
          Later
        </Button>
        <Button onClick={update} loading={updating} loadingText="Updating...">
          Update now
        </Button>
      </footer>
    </Dialog>
  );
};
