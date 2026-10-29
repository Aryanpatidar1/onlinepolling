export const generateSlug = (text) => {
  const basicSlug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const random = Math.random().toString(36).substring(2, 7);
  return `${basicSlug}-${random}`;
};
