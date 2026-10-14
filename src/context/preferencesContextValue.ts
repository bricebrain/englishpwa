import { createContext } from 'react';

import type { UserPreferences } from '@/types/learning';

export interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (update: Partial<UserPreferences>) => void;
  updateProfile: (update: Partial<UserPreferences['profile']>) => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);
