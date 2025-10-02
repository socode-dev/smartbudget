import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../store/useAuthStore";
import Dialog from "../ui/Dialog";

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
    <Dialog ariaLabel="reset-link-sent">
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
    </Dialog>
  );
};

export default ResetLink;
