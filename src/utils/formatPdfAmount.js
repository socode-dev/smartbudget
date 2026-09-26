export const formatPdfAmount = (amount, currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount ?? 0)
    .replace(/\u00a0/g, " ");
