export const getSnakeCaseValue = (value) => {
  const splitValue = value?.split(" ");
  const capitalizedValue = splitValue?.map((v) => {
    if (v === "a" && v.length === 1) return "a";
    return v.slice(0, 1).toUpperCase() + v.slice(1).toLowerCase();
  });

  return capitalizedValue?.join(" ");
};
