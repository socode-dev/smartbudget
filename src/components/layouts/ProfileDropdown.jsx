import clsx from "clsx";
import { useAuthContext } from "../../context/AuthContext";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

const ProfileDropdown = ({ open, onClose }) => {
  const { setIsSignoutPromptOpen, userName, isUserEmailVerified } =
    useAuthContext();

  const openSignoutPropmt = () => {
    onClose();
    setIsSignoutPromptOpen(true);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      className="absolute right-4 top-12 w-max bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-base font-medium p-4"
    >
      <FaUserCircle className="text-4xl md:text-5xl text-[rgb(var(--color-muted))] mx-auto" />
      <h2 className="text-xl font-medium mt-3">{userName?.fullName}</h2>
      <p className="text-sm text-[rgb(var(--color-muted))]">
        Status:{" "}
        <span
          className={clsx(
            "font-light",
            isUserEmailVerified ? "text-green-600" : "text-red-600"
          )}
        >
          {isUserEmailVerified ? "Verified" : "Unverified"}
        </span>
      </p>

      <button
        onClick={openSignoutPropmt}
        className="flex gap-1.5 items-center mt-15 cursor-pointer text-red-600 font-medium hover:text-red-700 transition"
      >
        <FaSignOutAlt />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default ProfileDropdown;
