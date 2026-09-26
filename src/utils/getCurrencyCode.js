import currencyCodes from "currency-codes/data";

export const getCurrencyName = (code) => {
  const entry = currencyCodes.find((c) => c.code === code);
  return entry ? entry.currency : code;
};

export const getCurrencySymbol = (code) => {
  try {
    return (
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value || code
    );
  } catch {
    return code;
  }
};
