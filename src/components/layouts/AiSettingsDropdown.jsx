import { FaBellSlash } from "react-icons/fa";

const AiSettingsDropdown = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="absolute -right-14 top-10 ml-2 w-56 bg-[rgb(var(--color-gray-bg))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-70 text-xs">
      <ul className="py-2">
        <li className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg-settings))] transition-colors">
          <span>Enable Forecasting</span>
          {/* Placeholder for toggle */}
          <button className="ml-2 w-10 h-5 bg-gray-200 rounded-full relative focus:outline-none">
            <span
              className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform"
              style={{ transform: "translateX(0)" }}
            ></span>
          </button>
        </li>
        <li className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg-settings))] transition-colors">
          <span>Show Savings Suggestions</span>
          {/* Placeholder for toggle */}
          <button className="ml-2 w-10 h-5 bg-gray-200 rounded-full relative focus:outline-none">
            <span
              className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform"
              style={{ transform: "translateX(0)" }}
            ></span>
          </button>
        </li>
        <li className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg-settings))] transition-colors">
          <span>Overspending Alerts</span>
          {/* Mute option */}
          <button
            className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Mute Alerts"
          >
            <FaBellSlash size={16} />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AiSettingsDropdown;
