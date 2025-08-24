import AiSettingsDropdown from "./AiSettingsDropdown";
import useThemeStore from "../../store/useThemeStore";
import useCurrencyStore from "../../store/useCurrencyStore";
import { FaSun, FaMoon, FaChevronDown, FaChevronUp } from "react-icons/fa";
import CurrencyFlag from "react-currency-flags";
import clsx from "clsx";
import { useMainContext } from "../../context/MainContext";
import CurrencyDropdown from "./CurrencyDropdown";

const SettingsDropdown = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { selectedCurrency } = useCurrencyStore();
  const {
    isSettingsOpen,
    isAISettingsOpen,
    aiSettingsRef,
    currencyRef,
    handleCurrencyToggle,
    handleAISettingsToggle,
    handlePreferencesOpen,
  } = useMainContext();

  if (!isSettingsOpen) return null;

  return (
    // <div className="">
    <ul className="py-2 flex flex-col items-start absolute right-0 top-15 w-56 bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-sm font-medium overflow-y-visible">
      {/* Theme mode switch */}
      <li className="w-full px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition">
        <span>Theme</span>
        {/* Sun/Moon sliding switch */}
        <button
          className={clsx(
            "ml-2 w-13 h-6 rounded-full relative focus:outline-none cursor-pointer transition flex items-center",
            theme === "dark"
              ? "bg-[rgb(var(--color-brand-deep))]"
              : "bg-gray-200"
          )}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <span
            className={clsx(
              "absolute top-0.5 mx-1 w-5 h-5 flex items-center justify-center rounded-full shadow transition duration-300",
              theme === "dark"
                ? "translate-x-6 bg-gray-900 text-yellow-300"
                : "translate-x-0 bg-yellow-400 text-white"
            )}
          >
            {theme === "dark" ? (
              <FaMoon className="text-base" />
            ) : (
              <FaSun className="text-base" />
            )}
          </span>
        </button>
      </li>

      {/* Currency selector */}
      <li
        role="button"
        onClick={handleCurrencyToggle}
        className="w-full px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition relative"
        ref={currencyRef}
      >
        <span className="flex-1">Currency</span>
        <button className="ml-2 px-2 py-1 rounded text-xs bg-[rgb(var(--color-gray-bg))] flex items-center gap-2">
          <CurrencyFlag currency={selectedCurrency} size="md" />
          <span className="text-gray-500">({selectedCurrency})</span>
        </button>

        {/* Currency dropdown */}
        <CurrencyDropdown />
      </li>

      {/* Preferences button */}
      <button
        onClick={handlePreferencesOpen}
        className="w-full text-left px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition"
      >
        Preferences
      </button>

      {/* AI Settings */}
      <button
        className="w-full px-4 py-2 cursor-pointer relative flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition"
        ref={aiSettingsRef}
      >
        <span
          onClick={handleAISettingsToggle}
          className="flex-1 flex items-center justify-between"
        >
          AI Settings
          {isAISettingsOpen ? (
            <FaChevronUp className="ml-2" />
          ) : (
            <FaChevronDown className="ml-2" />
          )}
        </span>
        <AiSettingsDropdown />
      </button>

      {/* Export all data */}
      <button className="w-full text-left px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition">
        Export All Data
      </button>

      {/* Help center */}
      <button className="w-full text-left px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition">
        Help
      </button>
    </ul>
  );
};

export default SettingsDropdown;
