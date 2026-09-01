const normalizePart = (value) => String(value ?? "").trim().toLowerCase();

const slugify = (value) => {
  const normalizedValue = normalizePart(value);

  return normalizedValue ? normalizedValue.replace(/\s+/g, "-") : "unknown";
};

const resolveCategoryKeyArgs = (optionsOrPrefix, categoryArg, argCount) => {
  if (
    optionsOrPrefix &&
    typeof optionsOrPrefix === "object" &&
    !Array.isArray(optionsOrPrefix)
  ) {
    return {
      prefix: optionsOrPrefix.prefix,
      category: optionsOrPrefix.category,
    };
  }

  if (argCount === 1) {
    return {
      prefix: optionsOrPrefix,
      category: optionsOrPrefix,
    };
  }

  return {
    prefix: optionsOrPrefix,
    category: categoryArg,
  };
};

export const generateCategoryKey = (...args) => {
  const [optionsOrPrefix, categoryArg] = args;
  const { prefix, category } = resolveCategoryKeyArgs(
    optionsOrPrefix,
    categoryArg,
    args.length,
  );

  const normalizedPrefix = normalizePart(prefix);
  const slug = slugify(category);

  return normalizedPrefix ? `${normalizedPrefix}:${slug}` : `:${slug}`;
};
