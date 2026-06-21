const LEGACY_CATEGORY_MAP = {
  Housing: 'Rent / Mortgage',
  Transportation: 'Transport',
};

export const normalizeCategoryValue = (value) => {
  if (!value) return 'Other';
  return LEGACY_CATEGORY_MAP[value] || value;
};
