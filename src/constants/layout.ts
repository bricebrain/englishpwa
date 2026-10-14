export const APP_LAYOUT = {
  compactMax: 599,
  expandedMax: 899,
  readingMaxWidth: 760,
  dashboardMaxWidth: 1200,
  bottomNavHeight: 68,
  railWidth: 96,
} as const;

export type LayoutMode = 'compact' | 'expanded' | 'wide';
