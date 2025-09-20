import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaListAlt,
  FaWallet,
  FaChartPie,
  FaBullseye,
  FaLightbulb,
  FaUserCircle,
} from "react-icons/fa";
import clsx from "clsx";
import { useMainContext } from "../../context/MainContext";
import useAuthStore from "../../store/useAuthStore";

const navLinks = [
  { to: "/", icon: FaTachometerAlt, label: "Overview" },
  { to: "/transactions", icon: FaListAlt, label: "Transactions" },
  { to: "/budgets", icon: FaWallet, label: "Budgets" },
  { to: "/goals", icon: FaBullseye, label: "Goals" },
  { to: "/insights", icon: FaLightbulb, label: "Insights" },
  { to: "/reports", icon: FaChartPie, label: "Reports" },
];

const Sidebar = () => {
  const location = useLocation();
  const userName = useAuthStore((state) => state.userName);
  const { isSidebarOpen, handleSidebarClose } = useMainContext();
  const [hovered, setHovered] = useState(false);

  // Sidebar expanded if hovered (desktop) or open (mobile)
  const expanded = hovered || isSidebarOpen;

  return (
    <aside className="w-fit">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          role="button"
          className={clsx(
            "fixed inset-0 bg-black/20 z-60 lg:hidden transition-opacity duration-200",
            isSidebarOpen ? "block" : "hidden"
          )}
          onClick={handleSidebarClose}
          aria-label="Close sidebar overlay"
        />
      )}
      <section
        className={clsx(
          "fixed left-0 top-0 h-dvh bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] flex flex-col shadow-lg transition-all duration-200 z-70 lg:translate-x-0 lg:static p-3",
          isSidebarOpen ? "translate-x-0" : "-translate-x-100 lg:translate-x-0",
          expanded ? "lg:w-48 w-56" : "lg:w-20 w-16"
        )}
        style={{ minWidth: expanded ? "10rem" : "4rem" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <h1 className=" bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl md:text-2xl py-1.5">
          SB
        </h1>
        {/* Navigation */}
        <nav className="flex flex-col grow gap-2 mt-12 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={handleSidebarClose}
              aria-label={link.label}
              className={clsx(
                "relative group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[rgb(var(--color-brand-deep))] hover:text-white transition-colors text-[rgb(var(--color-muted))] text-base",
                expanded ? "justify-start pl-3" : "justify-center",
                location.pathname === link.to
                  ? "bg-[rgb(var(--color-status-bg-blue))] text-blue-600"
                  : ""
              )}
            >
              <link.icon className="text-lg" />
              {/* Label: show if expanded (sidebar open or hovered) */}
              <span
                className={clsx(
                  "transition-all duration-200",
                  expanded ? "inline" : "hidden"
                )}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div
          className={clsx(
            "flex items-center bg-[rgb(var(--color-brand))] text-white gap-2 px-4 rounded-lg py-2",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          <FaUserCircle className="text-3xl" />
          <span
            className={clsx(
              "text-sm transition-all duration-200 truncate max-w-full",
              expanded ? "inline" : "hidden"
            )}
          >
            {userName?.fullName?.toUpperCase()}
          </span>
        </div>
        {/* </div> */}
      </section>
    </aside>
  );
};

export default Sidebar;
