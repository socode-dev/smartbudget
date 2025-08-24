import clsx from "clsx";
import { useMainContext } from "../../context/MainContext";
import useCurrencyStore from "../../store/useCurrencyStore";
import { getCurrencyName } from "../../utils/getCurrencyCode";
import CurrencyFlag from "react-currency-flags";

const CurrencyDropdown = () => {
  const mainContext = useMainContext();
  const isCurrencyOpen = mainContext.isCurrencyOpen;

  const {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    handleCurrencyClose,
  } = useCurrencyStore();

  if (!isCurrencyOpen) return null;

  const handleSelectCurrency = (code) => {
    setSelectedCurrency(code);
    handleCurrencyClose;
  };

  return (
    <div className="absolute right-0 top-full mt-1 w-56 max-h-60 overflow-y-auto bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded shadow z-70">
      <ul>
        {currencies.map((code) => (
          <li
            key={code}
            className={clsx(
              "px-4 py-2 cursor-pointer hover:bg-[rgb(var(--color-gray-bg))] transition flex items-center gap-2",
              selectedCurrency === code ? "font-bold text-blue-600" : ""
            )}
            onClick={() => handleSelectCurrency(code)}
          >
            <CurrencyFlag currency={code} size="sm" />
            <span>{getCurrencyName(code)}</span>
            <span className="text-gray-500">({code})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyDropdown;
