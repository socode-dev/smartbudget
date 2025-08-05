import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaBars, FaSearch, FaCog } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import SettingsDropdown from "./SettingsDropdown";
import NotificationDropdown from "./NotificationDropdown";
import Input from "../ui/Input";

const Header = ({ onSidebarToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const settingsRef = useRef(null);
  const notificationRef = useRef(null);
  const searchInputRef = useRef(null);

  // For demonstration, replace with your real notification logic

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
      <header className="lg:h-14 h-14 lg:relative fixed top-0 left-0 w-full bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] shadow flex items-center py-3 px-4 lg:px-6 justify-between z-50">
        {/* Left: Hamburger for mobile */}
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden mr-2 p-2 cursor-pointer"
            onClick={onSidebarToggle}
            aria-label="Open sidebar"
          >
            <FaBars size={22} />
          </button>
        </div>

        {/* Center: Searchbar on desktop */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <div className="w-96">
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              ref={searchInputRef}
            />
          </div>
        </div>

        {/* Right: Icons and User Avatar */}
        <div className="flex items-center gap-6">
          {/* Mobile: show search icon */}
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer relative lg:hidden"
            aria-label="Search"
            onClick={() => setShowMobileSearch((show) => !show)}
          >
            <FaSearch size={20} />
          </button>

          {/* Notification Icon with Dot */}
          <div className="relative" ref={notificationRef}>
            <button
              className="flex text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              aria-label="Notifications"
              onClick={() => setNotificationOpen((open) => !open)}
              type="button"
            >
              <span className="relative inline-block">
                <FaRegBell size={20} />
                <span
                  className={`absolute -top-1 right-0 w-2 h-2 rounded-full border-2 border-[rgb(var(--color-bg))] ${
                    hasNewNotification ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
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
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              aria-label="Settings"
              onClick={() => setDropdownOpen((open) => !open)}
              type="button"
            >
              <FaCog size={20} />
            </button>
            <SettingsDropdown
              open={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
            />
          </div>
          <button className="text-[rgb(var(--color-muted))] hover:text-blue-600 transition-colors cursor-pointer">
            <FaUserCircle size={28} />
          </button>
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
