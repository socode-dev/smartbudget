import clsx from "clsx";
import { useAuthContext } from "../../context/AuthContext";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useMainContext } from "../../context/MainContext";

const ProfileDropdown = () => {
  const { userName, isUserEmailVerified, currentUser } = useAuthContext();
  const { isProfileOpen, handleSignoutPromptOpen } = useMainContext();

  if (!isProfileOpen) return null;

  return (
    <div
      role="dialog"
      className="absolute right-2 top-12 w-max bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-base font-medium p-6"
    >
      <FaUserCircle className="text-5xl md:text-6xl text-[rgb(var(--color-muted))]" />
      <h2 className="text-xl font-medium mt-3">{userName?.fullName}</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mt-1">
        Email: <span className="font-light">{currentUser?.email}</span>
      </p>
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
        onClick={handleSignoutPromptOpen}
        className="flex gap-1.5 items-center mt-15 cursor-pointer text-red-600 font-medium hover:text-red-700 transition"
      >
        <FaSignOutAlt />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default ProfileDropdown;
