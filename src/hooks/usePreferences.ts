import { useContext } from 'react';

import { PreferencesContext } from '@/context/preferencesContextValue';

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences doit être utilisé dans PreferencesProvider');
  return context;
}
