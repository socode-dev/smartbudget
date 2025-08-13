import currencyCodes from "currency-codes/data";

export const getCurrencyName = (code) => {
  const entry = currencyCodes.find((c) => c.code === code);
  return entry ? entry.currency : code;
};
