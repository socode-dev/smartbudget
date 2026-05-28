export const formatAmount = ({amount, currency}) => {
  const safeAmount = amount ?? 0;

  const formattedCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formattedCurrency.format(safeAmount);
  return formattedAmount;
};
