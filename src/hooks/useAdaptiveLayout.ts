import { useSyncExternalStore } from 'react';

import type { LayoutMode } from '@/constants/layout';

// Mêmes seuils que les points de rupture Tailwind `sm` et `md` définis dans styles.css.
const EXPANDED_QUERY = '(min-width: 600px)';
const WIDE_QUERY = '(min-width: 900px)';

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useAdaptiveLayout(): LayoutMode {
  const wide = useMediaQuery(WIDE_QUERY);
  const expanded = useMediaQuery(EXPANDED_QUERY);

  if (wide) return 'wide';
  if (expanded) return 'expanded';
  return 'compact';
}
