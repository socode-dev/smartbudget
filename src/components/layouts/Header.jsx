import { FaBars } from "react-icons/fa";
import { HiOutlineCog8Tooth } from "react-icons/hi2";
import { FaRegBell } from "react-icons/fa6";
import SettingsDropdown from "./SettingsDropdown";
import ProfileDropdown from "./ProfileDropdown";
import { useAuthContext } from "../../context/AuthContext";
import useNotificationStore from "../../store/useNotificationStore";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../context/MainContext";
import HeaderSkeleton from "../skeletons/HeaderSkeleton";

const Header = () => {
  const navigate = useNavigate();
  const { userName } = useAuthContext();
  const { notifications } = useNotificationStore();
  const {
    settingsRef,
    profileRef,
    handleSidebarOpen,
    handleSettingsToggle,
    handleProfileToggle,
  } = useMainContext();

  if (!userName) {
    return <HeaderSkeleton />;
  }

  // Get unread notifications
  const newNotifications = notifications?.filter((notif) => !notif?.read);
  // console.log(newNotifications);

  return (
    <header className="h-16 lg:relative fixed top-0 left-0 w-full bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] shadow flex items-center py-3 px-4 lg:px-6 z-50">
      {/* Left: Hamburger for mobile */}
      <div className="flex items-center gap-2">
        <button
          className="lg:hidden mr-2 p-2 cursor-pointer hover:text-[rgb(var(--color-brand))]"
          onClick={handleSidebarOpen}
          aria-label="Open sidebar"
        >
          <FaBars className="text-xl transition" />
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        className="text-lg md:text-xl grow font-semibold text-[rgb(var(--color-muted))] text-left ml-4 cursor-pointer"
      >
        Dashboard
      </button>

      {/* Right: Icons and User Avatar */}
      <div className="flex items-center gap-6">
        {/* Notification Icon with new notification counts(if there is any) */}
        <button
          className="relative flex p-2 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-status-bg-blue))] rounded-lg shadow text-[rgb(var(--color-brand))] hover:text-[rgb(var(--color-brand-hover)] transition cursor-pointer"
          onClick={() => navigate("/notifications")}
          type="button"
        >
          <FaRegBell className="text-lg" />

          {newNotifications?.length > 0 && (
            <span className="py-1 px-2 bg-red-600 text-white text-[12px] absolute -top-3 -right-2 rounded-lg">
              {newNotifications?.length}
            </span>
          )}
        </button>

        {/* Settings Icon with Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            className="flex items-center p-2 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-status-bg-blue))] rounded-lg shadow text-[rgb(var(--color-brand))] hover:text-[rgb(var(--color-brand-hover)] transition cursor-pointer"
            aria-label="Settings"
            onClick={handleSettingsToggle}
            type="button"
          >
            <HiOutlineCog8Tooth className="text-xl" />
          </button>
          <SettingsDropdown />
        </div>
        <div className="relative" ref={profileRef}>
          <button
            onClick={handleProfileToggle}
            className="text-base tracking-wide text-white font-bold bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] px-2.5 py-1.5 rounded-full transition cursor-pointer"
          >
            {userName.initials ?? "SB"}
          </button>

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
