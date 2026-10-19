import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readThemePreference, resolveTheme, saveThemePreference, THEME_STORAGE_KEY } from '@/services/themePreference';

describe('themePreference', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); },
    });
  });

  it('suit le système par défaut', () => {
    expect(readThemePreference()).toBe('system');
  });

  it('retrouve le choix enregistré', () => {
    expect(saveThemePreference('dark')).toBe(true);
    expect(readThemePreference()).toBe('dark');
  });

  it('ignore une valeur inconnue', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readThemePreference()).toBe('system');
  });

  it('résout « système » selon la préférence de l’appareil', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });
});
