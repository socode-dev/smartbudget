// Generate key for each category and replace all spaces with hyphens
export const generateCategoryKey = (prefix, name) => {
  const slug = name?.trim()?.toLowerCase()?.replace(/\s+/g, "-");

  return `${prefix?.toLowerCase()}:${slug}`;
};
