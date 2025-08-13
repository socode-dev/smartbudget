import CURRENCY_SYMBOLS from "../data/currencySymbols";

export const formatAmount = (selectedCurrency) => {
  let format = new Intl.NumberFormat(CURRENCY_SYMBOLS[selectedCurrency], {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return format;
};
