import { FaBars } from "react-icons/fa";
import { HiOutlineCog8Tooth } from "react-icons/hi2";
import { FaRegBell } from "react-icons/fa6";
import SettingsDropdown from "./SettingsDropdown";
import ProfileDropdown from "./ProfileDropdown";
import useNotificationStore from "../../store/useNotificationStore";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../context/MainContext";
import useAuthStore from "../../store/useAuthStore";
import { getDemoPath, useDemoMode } from "../../demo/useDemoMode";

const Header = () => {
  const navigate = useNavigate();
  const isDemoMode = useDemoMode();
  const userName = useAuthStore((state) => state.userName);
  const notifications = useNotificationStore((state) => state.notifications);
  const {
    settingsRef,
    profileRef,
    handleSidebarOpen,
    isSettingsOpen,
    handleSettingsToggle,
    isProfileOpen,
    handleProfileToggle,
  } = useMainContext();

  const newNotifications = notifications?.filter((notif) => !notif?.read);

  return (
    <header className="h-16 lg:relative fixed top-0 left-0 w-full bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] shadow flex items-center py-3 px-4 lg:px-6 z-50">
      
      <button
        type="button"
        aria-haspopup="true"
        aria-label="Open sidebar menu"
        onClick={handleSidebarOpen}
        className="lg:hidden mr-2 p-2 cursor-pointer hover:text-[rgb(var(--color-brand))]"
      >
        <FaBars aria-hidden="true" className="text-xl transition" />
      </button>
      
      <button
        type="button"
        onClick={() => navigate(isDemoMode ? getDemoPath("/") : "/")}
        className="text-lg md:text-xl grow font-semibold text-[rgb(var(--color-muted))] text-left ml-4 cursor-pointer"
      >
        Dashboard
      </button>

      <div className="flex items-center gap-6">

        <button
          type="button"
          aria-label="Open notifications"
          onClick={() => navigate(isDemoMode ? getDemoPath("/notifications") : "/notifications")}
          className="relative flex p-2 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-status-bg-blue))] rounded-lg shadow text-[rgb(var(--color-brand))] hover:text-[rgb(var(--color-brand-hover)] transition cursor-pointer"
        >
          <FaRegBell aria-hidden="true" className="text-lg" />

          {newNotifications && newNotifications?.length > 0 && (
            <span
            aria-live="polite" 
            aria-label={`${newNotifications.length} unread ${newNotifications.length <= 1 ? "notification" : "notifications"}`} 
            className="py-1 px-2 bg-red-600 text-white text-[12px] absolute -top-3 -right-2 rounded-lg">
              {newNotifications.length}
            </span>
          )}
        </button>

        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={handleSettingsToggle}
            aria-expanded={isSettingsOpen}
            aria-label="Open Settings"
            aria-haspopup="true"
            aria-controls="settings-menu"
            className="flex items-center p-2 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-status-bg-blue))] rounded-lg shadow text-[rgb(var(--color-brand))] hover:text-[rgb(var(--color-brand-hover)] transition cursor-pointer"
          >
            <HiOutlineCog8Tooth aria-hidden="true" className="text-xl" />
          </button>

          <SettingsDropdown />
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={handleProfileToggle}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            aria-controls="profile-menu"
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
