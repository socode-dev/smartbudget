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
        <section className="bg-[rgb(var(--color-bg-card))] w-11/12 max-w-lg h-auto overflow-y-auto p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl md:text-3xl font-semibold mb-1">{title}</h2>
          <p className="text-base text-[rgb(var(--color-muted))] mb-6">
            {description}
          </p>
          <ModalForm label={label} mode={mode} />
        </section>
      </motion.div>
    </>
  );
};

export default Modal;
