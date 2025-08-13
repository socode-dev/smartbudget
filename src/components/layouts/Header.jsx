import { useState, useRef, useEffect } from "react";
import { FaBars, FaSearch, FaCog } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import SettingsDropdown from "./SettingsDropdown";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import Input from "../ui/Input";
import { useAuthContext } from "../../context/AuthContext";
import clsx from "clsx";

const Header = ({ onSidebarToggle }) => {
  const { userName } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [openProfileDropdown, setOpenProfileDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const settingsRef = useRef(null);
  const notificationRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus searchbar when shown on mobile
  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  // Close settings dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close notification dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    }
    if (notificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationOpen]);

  return (
    <>
      <header className="h-16 lg:relative fixed top-0 left-0 w-full bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] shadow flex items-center py-3 px-4 lg:px-6 justify-between z-50">
        {/* Left: Hamburger for mobile */}
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden mr-2 p-2 cursor-pointer hover:text-[rgb(var(--color-brand))]"
            onClick={onSidebarToggle}
            aria-label="Open sidebar"
          >
            <FaBars className="text-2xl transition" />
          </button>
        </div>

        {/* Center: Searchbar on desktop */}
        {/* <div className="hidden lg:flex items-center justify-center flex-1">
          <div className="w-96">
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              ref={searchInputRef}
            />
          </div>
        </div> */}
        <h2 className="text-xl md:text-2xl font-semibold text-[rgb(var(--color-muted))]">
          Financial Dashboard
        </h2>

        {/* Right: Icons and User Avatar */}
        <div className="flex items-center gap-6">
          {/* Mobile: show search icon */}
          {/* <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition cursor-pointer relative lg:hidden"
            aria-label="Search"
            onClick={() => setShowMobileSearch((show) => !show)}
          >
            <FaSearch size={20} />
          </button> */}

          {/* Notification Icon with Dot */}
          <div className="relative" ref={notificationRef}>
            <button
              className={clsx(
                "flex text-gray-600 hover:text-[rgb(var(--color-brand))] transition cursor-pointer"
              )}
              aria-label="Notifications"
              onClick={() => setNotificationOpen((open) => !open)}
              type="button"
            >
              <FaRegBell className="text-2xl" />
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
              <FaCog className="text-2xl" />
            </button>
            <SettingsDropdown
              open={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setOpenProfileDropdown((prev) => !prev)}
              className="text-lg text-white font-bold bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] px-2.5 py-1.5 rounded-full transition cursor-pointer"
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
      {/* Mobile searchbar below header */}
      {showMobileSearch && (
        <div className="lg:hidden fixed top-14 left-0 w-full bg-white z-40 px-4 py-2 shadow flex justify-center">
          <div className="w-full max-w-[500px]">
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              ref={searchInputRef}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
