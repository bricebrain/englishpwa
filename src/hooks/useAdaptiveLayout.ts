import { useMediaQuery, useTheme } from '@mui/material';

import type { LayoutMode } from '@/constants/layout';

export function useAdaptiveLayout(): LayoutMode {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const expanded = useMediaQuery(theme.breakpoints.up('sm'));

  if (wide) return 'wide';
  if (expanded) return 'expanded';
  return 'compact';
}
