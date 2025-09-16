import CURRENCY_SYMBOLS from "../data/currencySymbols";

export const formatAmount = (amount, selectedCurrency) => {
  const formattedCurrency = new Intl.NumberFormat(
    CURRENCY_SYMBOLS[selectedCurrency],
    {
      style: "currency",
      currency: selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  const formattedAmount = formattedCurrency.format(amount);
  return formattedAmount;
};
