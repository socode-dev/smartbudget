import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { FaCheck } from "react-icons/fa";

const ResetSuccessful = () => {
  const navigate = useNavigate();
  const { openResetSuccessModal, setOpenResetSuccessModal } = useAuthContext();

  if (!openResetSuccessModal) return null;

  const onClose = () => {
    setOpenResetSuccessModal(false);
    navigate("/login");
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-60" />

      <div
        role="dialog"
        className="fixed inset-0 top-[50%] left-[50%] -translate-[50%] flex flex-col items-center justify-center text-center gap-4 z-70 bg-[rgb(var(--color-bg-card))] p-4 w-4/5 max-w-[400px] h-fit rounded-lg"
      >
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
      </div>
    </>
  );
};

export default ResetSuccessful;
