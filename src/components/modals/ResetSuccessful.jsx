import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import useAuthStore from "../../store/useAuthStore";
import Dialog from "../ui/Dialog";

const ResetSuccessful = () => {
  const navigate = useNavigate();
  const openResetSuccessModal = useAuthStore(
    (state) => state.openResetSuccessModal
  );
  const setOpenResetSuccessModal = useAuthStore(
    (state) => state.setOpenResetSuccessModal
  );

  if (!openResetSuccessModal) return null;

  const onClose = () => {
    setOpenResetSuccessModal(false);
    navigate("/login");
  };

  return (
    <Dialog ariaLabel="reset-successful">
      <div className="border rounded-full border-green-500 p-3">
        <FaCheck className="text-green-600" />
      </div>
      <h4 className="text-xl font-semibold text-[rgb(var(--color-text))]">
        Password Changed
      </h4>
      <p className="text-base text-[rgb(var(--color-muted))] font-medium">
        Your password has changed successfully
      </p>

      <button
        onClick={onClose}
        className="text-base font-medium px-4 py-2 bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] text-white rounded transition cursor-pointer"
      >
        Back to Login
      </button>
    </Dialog>
  );
};

export default ResetSuccessful;
