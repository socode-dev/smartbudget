import { useAuthContext } from "../../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";

const ProfileDropdown = ({ open, onClose }) => {
  const { setIsSignoutPromptOpen } = useAuthContext();

  const openSignoutPropmt = () => {
    onClose();
    setIsSignoutPromptOpen(true);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      className="absolute right-0 mt-2 w-25 bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-xs font-medium"
    >
      <button
        onClick={openSignoutPropmt}
        className="w-full flex gap-1.5 items-center px-4 py-2 cursor-pointer text-red-500 font-semibold hover:bg-[rgb(var(--color-gray-bg))] transition-colors"
      >
        <FaSignOutAlt />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default ProfileDropdown;
