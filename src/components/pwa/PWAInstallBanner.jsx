import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";
import Button from "../ui/Button";

const PWAInstallBanner = ({ requiresIosInstructions, onOpen, onDismiss }) => (
  <motion.aside
    key="pwa-install-banner"
    initial={{ opacity: 0, x: 32, y: 8 }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    exit={{ opacity: 0, x: 32, y: 8 }}
    transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.8 }}
    aria-labelledby="pwa-install-banner-title"
    className="fixed right-4 bottom-4 z-60 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-popover p-4 text-foreground shadow-2xl"
  >
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">
        <FiDownload size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="pwa-install-banner-title" className="text-sm font-semibold">
          {requiresIosInstructions
            ? "Install Vydra on iPhone"
            : "Install Vydra"}
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {requiresIosInstructions
            ? "Add Vydra to your Home Screen for quick access."
            : "Open your financial workspace directly from this device."}
        </p>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap justify-end gap-2">
      <Button variant="ghost" onClick={onDismiss}>
        Not now
      </Button>
      <Button onClick={onOpen}>
        {requiresIosInstructions ? "View steps" : "Install app"}
      </Button>
    </div>
  </motion.aside>
);

export default PWAInstallBanner;
