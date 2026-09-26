import clsx from "clsx";
import { useMainContext } from "../../context/MainContext";
import useCurrencyStore from "../../store/useCurrencyStore";
import { getCurrencyName } from "../../utils/getCurrencyCode";
import CurrencyFlag from "react-currency-flags";

const CurrencyDropdown = () => {
  const { isCurrencyOpen, handleCurrencyClose } = useMainContext();
  const currencies = useCurrencyStore((state) => state.currencies);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const setSelectedCurrency = useCurrencyStore(state => state.setSelectedCurrency);

  if (!isCurrencyOpen) return null;

  const handleSelectCurrency = (code) => {
    setSelectedCurrency(code);
    handleCurrencyClose();
  };

  return (
    <div
      id="currency-options"
      aria-label="Currency options"
      className="max-h-52 overflow-y-auto border-y border-border py-1 scrollbar-thin"
    >
      {[...new Set([selectedCurrency, ...currencies])]
        .sort((a, b) => getCurrencyName(a).localeCompare(getCurrencyName(b)))
        .map((code) => (
          <button
            type="button"
            key={code}
            aria-pressed={selectedCurrency === code}
            className={clsx(
              "flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left [&:is(button)]:cursor-pointer [&:is(button)]:hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              selectedCurrency === code && "text-primary",
            )}
            onClick={() => handleSelectCurrency(code)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <CurrencyFlag currency={code} size="sm" />
              <span className="min-w-0 break-words">
                {getCurrencyName(code)}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">{code}</span>
          </button>
        ))}
    </div>
  );
};

export default CurrencyDropdown;
