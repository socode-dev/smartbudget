export const formatAmount = (amount, selectedCurrency) => {
  const safeAmount = amount ?? 0;

  const formattedCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formattedCurrency.format(safeAmount);
  return formattedAmount;
};
