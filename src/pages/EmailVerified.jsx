import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { FaCheck } from "react-icons/fa6";
import useAuthStore from "../store/useAuthStore";
import { motion } from "framer-motion";

const EmailVerified = () => {
  const user = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();

  const handleNavigate = () => {
    auth.currentUser.reload();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center gap-6 bg-[rgb(var(--color-bg-card))] mt-20 p-6 w-full max-w-[500px] mx-auto h-fit rounded-lg"
    >
      <div className="border rounded-full border-green-500 text-green-500 p-3">
        <FaCheck />
      </div>
      <h4 className="text-xl font-semibold text-[rgb(var(--color-text))]">
        Email verified
      </h4>
      <p className="text-base text-[rgb(var(--color-muted))] font-medium">
        Your email {user?.email} has been verified successfully. You can now
        access SmartBudget features.
      </p>

      <button
        onClick={handleNavigate}
        className="text-base font-medium px-4 py-2 bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] text-white rounded transition cursor-pointer"
      >
        Back to Dashboard
      </button>
    </motion.div>
  );
};

export default EmailVerified;
