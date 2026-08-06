import { CURRENCY_SYMBOLS } from "../data/currencySymbols";

export const formatAmount = (amount, selectedCurrency) => {
  const safeAmount = amount ?? 0;

  const locale = CURRENCY_SYMBOLS[selectedCurrency] ?? "en-US";

  const formattedCurrency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formattedCurrency.format(safeAmount);
  return formattedAmount;
};