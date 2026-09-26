import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../store/useAuthStore";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";

const ResetLink = () => {
  const navigate = useNavigate();
  const resetLinkModalOpen = useAuthStore((state) => state.resetLinkModalOpen);
  const setResetLinkModalOpen = useAuthStore(state => state.setResetLinkModalOpen);

  if (!resetLinkModalOpen) return null;

  const onClose = () => {
    setResetLinkModalOpen(false);
    navigate("/login");

    setTimeout(
      () =>
        toast.success(
          "Please check your inbox and spam folder for the password reset link",
          { duration: 10000, position: "top-center" },
        ),
      10,
    );
  };

  return (
    <Dialog ariaLabel="Password reset email sent">
      <div className="border rounded-full border-green-600 dark:border-green-400 p-3">
        <FaCheck
          aria-hidden="true"
          className="text-green-600 dark:text-green-400"
        />
      </div>
      <h4 className="font-display text-xl text-center font-semibold text-[rgb(var(--color-text))]">
        Email is sent
      </h4>
      <p className="text-sm text-center leading-relaxed text-[rgb(var(--color-muted))]">
        A message has been sent to your e-mail address for confirmation of
        password reset
      </p>

      <Button onClick={onClose} className="w-full">
        OK
      </Button>
    </Dialog>
  );
};

export default ResetLink;
