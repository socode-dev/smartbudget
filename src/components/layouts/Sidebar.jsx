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
import { useAuthContext } from "../../context/AuthContext";
import clsx from "clsx";

const navLinks = [
  { to: "/", icon: FaTachometerAlt, label: "Overview" },
  { to: "/transactions", icon: FaListAlt, label: "Transactions" },
  { to: "/budgets", icon: FaWallet, label: "Budgets" },
  { to: "/goals", icon: FaBullseye, label: "Goals" },
  { to: "/insights", icon: FaLightbulb, label: "Insights" },
  { to: "/reports", icon: FaChartPie, label: "Reports" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { userName } = useAuthContext();
  const [hovered, setHovered] = useState(false);

  // Sidebar expanded if hovered (desktop) or open (mobile)
  const expanded = hovered || isOpen;

  return (
    <aside className="w-fit">
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={clsx(
            "fixed inset-0 bg-black/20 z-60 lg:hidden transition-opacity duration-200",
            isOpen ? "block" : "hidden"
          )}
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}
      <section
        className={clsx(
          "fixed left-0 top-0 h-svh bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] flex flex-col shadow-lg transition-all duration-200 z-70 lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-100 lg:translate-x-0",
          expanded ? "lg:w-48 w-56" : "lg:w-20 w-16"
        )}
        style={{ minWidth: expanded ? "10rem" : "4rem" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <h1 className="mx-3 mt-3.5 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl md:text-2xl py-1.5">
          SB
        </h1>
        {/* Navigation */}
        <nav className="flex flex-col grow gap-2 mt-12 px-3 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              aria-label={link.label}
              className={clsx(
                "relative group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition-colors text-[rgb(var(--color-muted))] text-sm",
                expanded ? "justify-start pl-3" : "justify-center",
                location.pathname === link.to ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <link.icon className="text-lg" />
              {/* Label: show if expanded (sidebar open or hovered) */}
              <span
                className={clsx(
                  "font-medium transition-all duration-200",
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
            "flex items-center bg-[rgb(var(--color-brand))] text-white gap-2 px-4 mx-3 mb-6 rounded-lg py-2",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          <FaUserCircle className="text-3xl" />
          <span
            className={clsx(
              "font-semibold text-sm transition-all duration-200 truncate max-w-full",
              expanded ? "inline" : "hidden"
            )}
          >
            {userName.fullName.toUpperCase()}
          </span>
        </div>
        {/* </div> */}
      </section>
    </aside>
  );
};

export default Sidebar;
