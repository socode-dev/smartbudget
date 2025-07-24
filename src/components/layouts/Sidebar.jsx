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
  FaRegCreditCard,
} from "react-icons/fa";

const navLinks = [
  { to: "/", icon: <FaTachometerAlt size={20} />, label: "Overview" },
  { to: "/transactions", icon: <FaListAlt size={20} />, label: "Transactions" },
  { to: "/budgets", icon: <FaWallet size={20} />, label: "Budgets" },
  { to: "/goals", icon: <FaBullseye size={20} />, label: "Goals" },
  { to: "/insights", icon: <FaLightbulb size={20} />, label: "Insights" },
  { to: "/reports", icon: <FaChartPie size={20} />, label: "Reports" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // Sidebar expanded if hovered (desktop) or open (mobile)
  const expanded = hovered || isOpen;

  return (
    <aside className="w-fit">
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black/20 z-60 lg:hidden transition-opacity duration-200 ${
            isOpen ? "block" : "hidden"
          }`}
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}
      <section
        className={`fixed left-0 top-0 h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] flex flex-col shadow-lg transition-all duration-200 z-70 
          ${expanded ? "lg:w-48 w-56" : "lg:w-20 w-16"}
          lg:translate-x-0 lg:static
          ${isOpen ? "translate-x-0" : "-translate-x-100 lg:translate-x-0"}`}
        style={{ minWidth: expanded ? "10rem" : "4rem" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        {/* <div
          className={`h-16 flex items-center ${
            expanded ? "justify-start pl-4" : "justify-center"
          } transition-all duration-200`}
        >
        </div> */}
        <div className="w-14 h-8 ml-3 mt-3.5 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          SB
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-12 px-2 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              aria-label={link.label}
              className={`relative group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition-colors text-[rgb(var(--color-muted))] ${
                expanded ? "justify-start pl-2" : "justify-center"
              }  ${
                location.pathname === link.to ? "bg-blue-100 text-blue-700" : ""
              }`}
            >
              {link.icon}
              {/* Label: show if expanded (sidebar open or hovered) */}
              <span
                className={`font-medium text-xs transition-all duration-200 ${
                  expanded ? "inline" : "hidden"
                } custom980:inline`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
        {/* Record Sale Button (vertically between nav and user) */}
        <div className="flex flex-col mt-8">
          <div className="px-2 mb-4">
            <button
              className={`w-full flex items-center gap-2 py-2 rounded-lg bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] text-[rgb(var(--color-muted))] font-semibold transition cursor-pointer ${
                expanded ? "justify-start pl-2" : "justify-center"
              }`}
              aria-label="Record Sale"
            >
              <FaRegCreditCard size={20} />
              <span
                className={`font-medium text-xs transition-all duration-200 ${
                  expanded ? "inline" : "hidden"
                } custom980:inline`}
              >
                Record Sale
              </span>
            </button>
          </div>
          {/* User Info */}
          <div
            className={`flex items-center text-[rgb(var(--color-muted))] gap-2 mb-6 px-2 ${
              expanded ? "justify-start" : "justify-center"
            }`}
          >
            <FaUserCircle size={28} />
            <span
              className={` font-normal text-xs transition-all duration-200 ${
                expanded ? "inline" : "hidden"
              } custom980:inline`}
            >
              New User
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
