export const USER_CREATED_IMAGE_BORDER_COLOR = '#a855f7';

export const CATEGORY_COLORS = {
  'Personal Care': '#10b981',
  Food: '#f59e0b',
  'Holiday & Travel': '#3b82f6',
  Places: '#06b6d4',
  Medical: '#ef4444',
  'Early Years': '#f97316',
  School: '#6366f1',
  'Daily Routine': '#22c55e',
  Clothes: '#ec4899',
};

export const getCategoryColor = (categoryKey) => {
  if (typeof categoryKey !== 'string') return undefined;
  const trimmed = categoryKey.trim();
  return CATEGORY_COLORS[trimmed];
};

export const getActivityCardBorderColor = (activity, imageSource) => {
  // Any user-picked image (uri) uses a dedicated border color, regardless of category.
  if (imageSource && typeof imageSource === 'object' && typeof imageSource.uri === 'string') {
    return USER_CREATED_IMAGE_BORDER_COLOR;
  }

  return getCategoryColor(activity?.category);
};

export const allCategories = [
  { label: 'All', key: 'All', visible: true, color: '#0792e2ff' },
  { label: 'Personal Care', key: 'Personal Care', visible: true, color: CATEGORY_COLORS['Personal Care'] },
  { label: 'Food', key: 'Food', visible: true, color: CATEGORY_COLORS.Food },
  { label: 'Holiday & Travel', key: 'Holiday & Travel', visible: true, color: CATEGORY_COLORS['Holiday & Travel'] },
  { label: 'Places', key: 'Places', visible: true, color: CATEGORY_COLORS.Places },
  { label: 'Medical', key: 'Medical', visible: true, color: CATEGORY_COLORS.Medical },
  { label: 'Early Years', key: 'Early Years', visible: true, color: CATEGORY_COLORS['Early Years'] },
  { label: 'School', key: 'School', visible: true, color: CATEGORY_COLORS.School },
  { label: 'Daily Routine', key: 'Daily Routine', visible: true, color: CATEGORY_COLORS['Daily Routine'] },
  { label: 'Clothes', key: 'Clothes', visible: true, color: CATEGORY_COLORS.Clothes },
];

export const defaultCategories = [
  { key: 'Personal Care', label: 'Personal Care', visible: true, color: CATEGORY_COLORS['Personal Care'] },
  { key: 'Food', label: 'Food', visible: true, color: CATEGORY_COLORS.Food },
  { key: 'Holiday & Travel', label: 'Holiday & Travel', visible: false, color: CATEGORY_COLORS['Holiday & Travel'] },
  { key: 'Places', label: 'Places', visible: false, color: CATEGORY_COLORS.Places },
  { key: 'Medical', label: 'Medical', visible: false, color: CATEGORY_COLORS.Medical },
  { key: 'Early Years', label: 'Early Years', visible: false, color: CATEGORY_COLORS['Early Years'] },
  { key: 'School', label: 'School', visible: false, color: CATEGORY_COLORS.School },
  { key: 'Daily Routine', label: 'Daily Routine', visible: false, color: CATEGORY_COLORS['Daily Routine'] },
  { key: 'Clothes', label: 'Clothes', visible: false, color: CATEGORY_COLORS.Clothes },
];
