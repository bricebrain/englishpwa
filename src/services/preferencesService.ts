import type { UserPreferences } from '@/types/learning';

const STORAGE_KEY = 'english-fluency:preferences';

export const defaultPreferences: UserPreferences = {
  profile: { id: 'default', name: 'Brice', level: 'B1', dailyGoal: 20 },
  denseMode: true,
  autoPlayAudio: false,
  hapticsEnabled: true,
};

export function loadPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
