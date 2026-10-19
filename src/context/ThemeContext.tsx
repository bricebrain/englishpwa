import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
  systemPrefersDark,
  type ResolvedTheme,
  type ThemePreference,
} from '@/services/themePreference';

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState(readThemePreference);
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolved = resolveTheme(preference, prefersDark);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const value = useMemo<ThemeContextValue>(() => ({
    preference,
    resolved,
    setPreference(next) {
      saveThemePreference(next);
      setPreferenceState(next);
    },
  }), [preference, resolved]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return context;
}
