import { useState, useRef } from "react";
import { FaBars, FaCog } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import SettingsDropdown from "./SettingsDropdown";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import { useAuthContext } from "../../context/AuthContext";
import clsx from "clsx";
import { useDropdownClose } from "../../hooks/useDropdownClose";

const Header = ({ onSidebarToggle }) => {
  const { userName } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [openProfileDropdown, setOpenProfileDropdown] = useState(false);
  const settingsRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useDropdownClose(dropdownOpen, settingsRef, setDropdownOpen);
  useDropdownClose(notificationOpen, notificationRef, setNotificationOpen);
  useDropdownClose(openProfileDropdown, profileRef, setOpenProfileDropdown);

  return (
    <header className="h-16 lg:relative fixed top-0 left-0 w-full bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] shadow flex items-center py-3 px-4 lg:px-6 z-50">
      {/* Left: Hamburger for mobile */}
      <div className="flex items-center gap-2">
        <button
          className="lg:hidden mr-2 p-2 cursor-pointer hover:text-[rgb(var(--color-brand))]"
          onClick={onSidebarToggle}
          aria-label="Open sidebar"
        >
          <FaBars className="text-xl transition" />
        </button>
      </div>

      <h2 className="text-lg md:text-xl grow ml-4 font-semibold text-[rgb(var(--color-muted))]">
        Dashboard
      </h2>

      {/* Right: Icons and User Avatar */}
      <div className="flex items-center gap-6">
        {/* Notification Icon with Dot */}
        <div className="relative" ref={notificationRef}>
          <button
            className={clsx(
              "relative flex text-gray-600 hover:text-[rgb(var(--color-brand))] transition cursor-pointer"
            )}
            aria-label="Notifications"
            onClick={() => setNotificationOpen((open) => !open)}
            type="button"
          >
            <FaRegBell className="text-xl" />

            <span className="py-0.5 px-1 bg-red-600 text-white text-[10px] absolute -top-3 -right-2 rounded-lg">
              6
            </span>
          </button>
          <NotificationDropdown
            open={notificationOpen}
            onClose={() => setNotificationOpen(false)}
          />
        </div>
        {/* Settings Icon with Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition cursor-pointer"
            aria-label="Settings"
            onClick={() => setDropdownOpen((open) => !open)}
            type="button"
          >
            <FaCog className="text-xl" />
          </button>
          <SettingsDropdown
            open={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
          />
        </div>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setOpenProfileDropdown((prev) => !prev)}
            className="text-base tracking-wide text-white font-bold bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] px-2.5 py-1.5 rounded-full transition cursor-pointer"
          >
            {userName.initials ?? "SB"}
          </button>

          <ProfileDropdown
            open={openProfileDropdown}
            onClose={() => setOpenProfileDropdown(false)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
