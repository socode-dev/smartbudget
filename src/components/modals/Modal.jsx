import { motion } from "framer-motion";
import ModalForm from "../forms/ModalForm";

const Modal = ({ label, title, description, mode }) => {
  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-60" />
      {/* Centered Modal Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${label}-modal`}
        className="fixed inset-0 flex items-center justify-center z-70"
      >
        <header className="bg-[rgb(var(--color-bg-card))] w-5/6 md:w-4/6 lg:w-3/6 xl:w-2/6 h-5/6 max-w-md overflow-y-auto p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">{title}</h2>
          <p className="text-sm text-[rgb(var(--color-muted))] mb-4">
            {description}
          </p>
          <ModalForm label={label} mode={mode} />
        </header>
      </motion.div>
    </>
  );
};

export default Modal;
