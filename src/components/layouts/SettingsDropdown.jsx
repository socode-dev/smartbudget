import useThemeStore from "../../store/useThemeStore";
import useCurrencyStore from "../../store/useCurrencyStore";
import { FaSun, FaMoon } from "react-icons/fa";
import CurrencyFlag from "react-currency-flags";
import clsx from "clsx";
import { useMainContext } from "../../context/MainContext";
import CurrencyDropdown from "./CurrencyDropdown";
import { useOverviewContext } from "../../context/OverviewContext";
import Export from "../ui/Export";

const SettingsDropdown = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const { handleCSVExport, handlePDFExport } = useOverviewContext();
  const {
    isSettingsOpen,
    handleCurrencyToggle,
    handlePreferencesOpen,
    isExportOpen,
    setIsExportOpen,
    handleExportToggle,
  } = useMainContext();

  if (!isSettingsOpen) return null;

  const exportCSV = () => {
    handleCSVExport();
    setIsExportOpen(false);
  };

  const exportPDF = () => {
    handlePDFExport();
    setIsExportOpen(false);
  };

  return (
    // <div className="">
    <ul className="flex flex-col items-start absolute right-0 top-13 w-56 bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-sm overflow-y-visible">
      {/* Theme mode switch */}
      <li className="w-full px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition rounded-tl-lg rounded-tr-lg">
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
        className="w-full px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition relative"
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
        className="w-full text-left px-4 py-3 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition"
      >
        Preferences
      </button>

      {/* Export all data */}
      <div className="relative w-full">
        <button
          onClick={handleExportToggle}
          className="w-full text-left px-4 py-3 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition rounded-bl-lg rounded-br-lg"
        >
          Export All Data
        </button>

        <Export
          isExportOpen={isExportOpen}
          exportCSV={exportCSV}
          exportPDF={exportPDF}
        />
      </div>

      {/* Help center */}
      {/* <button className="w-full text-left px-4 py-3 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition">
        Help
      </button> */}
    </ul>
  );
};

export default SettingsDropdown;
