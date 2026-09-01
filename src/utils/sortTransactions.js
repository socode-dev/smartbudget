const toMillis = (value) => {
  if (!value) return 0;

  if (typeof value === "number") return value;

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1000000);
  }

  const date = new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
};

const toTransactionDateMillis = (dateValue) => {
  if (!dateValue) return 0;

  const rawDate = String(dateValue).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const [year, month, day] = rawDate.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  return toMillis(rawDate);
};

export const sortTransactionsByDateTime = (transactions = []) =>
  [...transactions].sort((a, b) => {
    const transactionDateDifference =
      toTransactionDateMillis(b?.date) - toTransactionDateMillis(a?.date);

    if (transactionDateDifference !== 0) return transactionDateDifference;

    const createdAtDifference = toMillis(b?.createdAt) - toMillis(a?.createdAt);

    if (createdAtDifference !== 0) return createdAtDifference;

    return String(b?.id ?? "").localeCompare(String(a?.id ?? ""));
  });
