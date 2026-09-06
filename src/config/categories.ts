export const AVAILABLE_CATEGORIES = ['motivation', 'love', 'success', 'inspiration'] as const;

export type CategorySlug = (typeof AVAILABLE_CATEGORIES)[number];
