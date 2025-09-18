// Generate key for each category and replace all spaces with hyphens
export const generateCategoryKey = (prefix, name) => {
  const slug = name?.trim()
    ? name?.trim()?.toLowerCase()?.replace(/\s+/g, "-")
    : "unknown";

  return prefix ? `${prefix?.toLowerCase()}:${slug}` : `:${slug}`;
};
