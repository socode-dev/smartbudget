import { FiDownload } from "react-icons/fi";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";
import PWAInstallDetails from "./PWAInstallDetails";

const PWAInstallDialog = ({
  open,
  requiresIosInstructions,
  installing,
  onClose,
  onInstall,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    padded={false}
    ariaLabelledBy="pwa-install-title"
    ariaDescribedBy="pwa-install-description"
    className="max-w-lg"
  >
    <header className="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">
        <FiDownload size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2
          id="pwa-install-title"
          className="font-display text-lg font-semibold"
        >
          {requiresIosInstructions
            ? "Install Vydra on iPhone"
            : "Install Vydra"}
        </h2>
        <p
          id="pwa-install-description"
          className="mt-1 text-sm leading-6 text-muted-foreground"
        >
          {requiresIosInstructions
            ? "Follow these steps to add Vydra to your Home Screen."
            : "Use Vydra as a focused application on this device."}
        </p>
      </div>
    </header>
    <PWAInstallDetails requiresIosInstructions={requiresIosInstructions} />
    <footer className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-5 py-4 sm:px-6">
      <Button variant="outline" onClick={onClose} disabled={installing}>
        {requiresIosInstructions ? "Close" : "Not now"}
      </Button>
      {requiresIosInstructions ? (
        <Button onClick={onClose}>Got it</Button>
      ) : (
        <Button
          onClick={onInstall}
          loading={installing}
          loadingText="Opening installer..."
        >
          Install app
        </Button>
      )}
    </footer>
  </Dialog>
);

export default PWAInstallDialog;
