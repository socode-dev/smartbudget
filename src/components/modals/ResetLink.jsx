import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

const ResetLink = () => {
  const navigate = useNavigate();
  const resetLinkModalOpen = useAuthStore((state) => state.resetLinkModalOpen);
  const setResetLinkModalOpen = useAuthStore(
    (state) => state.setResetLinkModalOpen
  );

  if (!resetLinkModalOpen) return;

  const onClose = () => {
    setResetLinkModalOpen(false);
    navigate("/login");

    setTimeout(
      () =>
        toast.success(
          "Please check your inbox and spam folder for the password reset link",
          { duration: 10000, position: "top-center" }
        ),
      10
    );
  };

  return (
    <AnimatePresence>
      {/* Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 w-full h-full bg-black/30 z-60"
      />

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        className="fixed inset-0 top-[50%] left-[50%] -translate-[50%] flex flex-col items-center justify-center text-center gap-3 z-70 bg-[rgb(var(--color-bg-card))] p-4 w-4/5 max-w-[400px] h-fit rounded-lg"
      >
        <div className="border rounded-full border-green-500 p-3">
          <FaCheck className="text-green-600" />
        </div>
        <h4 className="text-xl font-semibold text-[rgb(var(--color-text))]">
          Email is sent
        </h4>
        <p className="text-base text-[rgb(var(--color-muted))] font-medium">
          A message has been sent to your e-mail address for confirmation of
          password reset
        </p>

        <button
          onClick={onClose}
          className="text-base font-medium px-4 py-2 bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] text-white rounded transition cursor-pointer"
        >
          OK
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResetLink;
