import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import useAuthStore from "../../store/useAuthStore";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";

const ResetSuccessful = () => {
  const navigate = useNavigate();
  const openResetSuccessModal = useAuthStore(
    (state) => state.openResetSuccessfulModal,
  );
  const setOpenResetSuccessModal = useAuthStore(
    (state) => state.setOpenResetSuccessfulModal,
  );

  if (!openResetSuccessModal) return null;

  const onClose = () => {
    setOpenResetSuccessModal(false);
    navigate("/login");
  };

  return (
    <Dialog ariaLabel="Password changed successfully">
      <div className="border rounded-full border-green-600 dark:border-green-400 p-3">
        <FaCheck
          aria-hidden="true"
          className="text-green-600 dark:text-green-400"
        />
      </div>
      <h4 className="font-display text-xl text-center font-semibold text-[rgb(var(--color-text))]">
        Password Changed
      </h4>
      <p className="text-sm text-center leading-relaxed text-[rgb(var(--color-muted))]">
        Your password has changed successfully
      </p>

      <Button onClick={onClose} className="w-full">
        Back to Login
      </Button>
    </Dialog>
  );
};

export default ResetSuccessful;
