import { useEffect } from 'react';

interface LockableScreenOrientation extends ScreenOrientation {
  lock?: (orientation: 'portrait-primary') => Promise<void>;
}

interface StandaloneNavigator extends Navigator {
  standalone?: boolean;
}

function isInstalledApp(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as StandaloneNavigator).standalone === true;
}

export function usePortraitOrientationLock(): void {
  useEffect(() => {
    if (!isInstalledApp()) return;

    const orientation = screen.orientation as LockableScreenOrientation | undefined;
    const lockPortrait = () => {
      void orientation?.lock?.('portrait-primary').catch(() => {
        // Le manifeste reste la source principale si le navigateur refuse l’API.
      });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') lockPortrait();
    };

    lockPortrait();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('appinstalled', lockPortrait);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('appinstalled', lockPortrait);
    };
  }, []);
}
