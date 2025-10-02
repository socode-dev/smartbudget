import { AnimatePresence, motion } from "framer-motion";

const Dialog = ({ children, ariaLabel }) => {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 w-full h-full bg-black/30 z-60"
      />
      {/* Centered Modal Box */}
      <motion.div
        key="modal"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="fixed inset-0 top-[50%] left-[50%] -translate-[50%] flex flex-col items-center justify-center gap-5 z-70 bg-[rgb(var(--color-bg-card))] px-6 py-8 w-11/12 max-w-[500px] h-11/12 max-h-fit overflow-y-auto rounded-lg"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Dialog;
