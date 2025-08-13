import { useState, useRef, useEffect } from "react";
import AiSettingsDropdown from "./AiSettingsDropdown";
import useThemeStore from "../../store/useThemeStore";
import useCurrencyStore from "../../store/useCurrencyStore";
import {
  FaSun,
  FaMoon,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
} from "react-icons/fa";
import CurrencyFlag from "react-currency-flags";
import { useAuthContext } from "../../context/AuthContext";
import { getCurrencyName } from "../../utils/getCurrencyCode";
import CURRENCY_SYMBOLS from "../../data/currencySymbols";

const SettingsDropdown = ({ open, onClose }) => {
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const aiSettingsRef = useRef(null);
  const currencyRef = useRef(null);
  const { theme, toggleTheme } = useThemeStore();
  const {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    getCurrencySymbol,
    fetchCurrencies,
  } = useCurrencyStore();

  // Fetch currencies on open
  useEffect(() => {
    let isMounted = true;
    if (open && currencies.length === 0) {
      fetchCurrencies();
    }
    getCurrencySymbol(selectedCurrency);

    return () => (isMounted = false);
  }, [open, currencies.length, fetchCurrencies, selectedCurrency]);

  // useEffect(() => {
  //   let isMounted = true;

  //   return
  // }, []);

  // Close AI / Currency dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (aiSettingsRef.current && !aiSettingsRef.current.contains(e.target)) {
        setAiDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyDropdownOpen(false);
      }
    }
    if (aiDropdownOpen || currencyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [aiDropdownOpen, currencyDropdownOpen]);

  if (!open) return null;
  return (
    <div className="absolute right-0 mt-2 w-56 bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-xs font-medium overflow-y-visible">
      <ul className="py-2">
        <li className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition-colors">
          <span>Theme</span>
          {/* Sun/Moon sliding switch */}
          <button
            className={`ml-2 w-10 h-4 rounded-full relative focus:outline-none cursor-pointer transition-colors flex items-center ${
              theme === "dark" ? "bg-blue-600" : "bg-gray-200"
            }`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-0.5 mx-1 w-3 h-3 flex items-center justify-center rounded-full shadow transition-all duration-300 ${
                theme === "dark"
                  ? "translate-x-6 bg-gray-900 text-yellow-300"
                  : "translate-x-0 bg-yellow-400 text-white"
              }`}
            >
              {theme === "dark" ? <FaMoon size={11} /> : <FaSun size={11} />}
            </span>
          </button>
        </li>
        <li
          className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition-colors relative"
          ref={currencyRef}
        >
          <span
            onClick={() => setCurrencyDropdownOpen((open) => !open)}
            className="flex-1"
          >
            Currency
          </span>
          <button
            onClick={() => setCurrencyDropdownOpen((open) => !open)}
            className="ml-2 px-2 py-1 rounded text-xs bg-[rgb(var(--color-gray-bg))] flex items-center gap-2"
          >
            <CurrencyFlag currency={selectedCurrency} size="md" />
            <span className="text-gray-500">({selectedCurrency})</span>
          </button>
          {currencyDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 max-h-60 overflow-y-auto bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded shadow z-70">
              <ul>
                {currencies.map((code) => (
                  <li
                    key={code}
                    className={`px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition-colors flex items-center gap-2 ${
                      selectedCurrency === code ? "font-bold text-blue-600" : ""
                    }`}
                    onClick={() => {
                      setSelectedCurrency(code);
                      setCurrencyDropdownOpen(false);
                    }}
                  >
                    <CurrencyFlag currency={code} size="sm" />
                    <span>{getCurrencyName(code)}</span>
                    <span className="text-gray-500">({code})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
        <li
          className="px-4 py-2 cursor-pointer relative flex items-center justify-between hover:bg-[rgb(var(--color-gray-bg))] transition-colors"
          ref={aiSettingsRef}
        >
          <span
            onClick={() => setAiDropdownOpen((open) => !open)}
            className="flex-1 flex items-center justify-between"
          >
            AI Settings
            {aiDropdownOpen ? (
              <FaChevronUp className="ml-2" />
            ) : (
              <FaChevronDown className="ml-2" />
            )}
          </span>
          <AiSettingsDropdown
            open={aiDropdownOpen}
            onClose={() => setAiDropdownOpen(false)}
          />
        </li>
        <li className="px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition-colors">
          Export All Data
        </li>
        <li className="px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition-colors">
          Reset App
        </li>
        <li className="px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition-colors">
          Help
        </li>
      </ul>
    </div>
  );
};

export default SettingsDropdown;
