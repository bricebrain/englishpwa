import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { PreferencesContext, type PreferencesContextValue } from '@/context/preferencesContextValue';
import { configureFeedback } from '@/services/feedbackService';
import { loadPreferences, savePreferences } from '@/services/preferencesService';

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(loadPreferences);

  useEffect(() => {
    configureFeedback({ sound: preferences.soundEnabled, haptics: preferences.hapticsEnabled });
  }, [preferences.hapticsEnabled, preferences.soundEnabled]);

  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    updatePreferences(update) {
      setPreferences((current) => {
        const next = { ...current, ...update };
        savePreferences(next);
        return next;
      });
    },
    updateProfile(update) {
      setPreferences((current) => {
        const next = { ...current, profile: { ...current.profile, ...update } };
        savePreferences(next);
        return next;
      });
    },
  }), [preferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
