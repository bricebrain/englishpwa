import { AudioLines, BookOpen, CloudOff, House, LayoutGrid, ListMusic, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { XpToaster } from '@/components/ui/Gamification';
import { Aurora } from '@/components/vivid/Aurora';
import { APP_LAYOUT } from '@/constants/layout';
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const NAVIGATION: NavigationItem[] = [
  { label: 'Aujourd’hui', path: '/', icon: House },
  { label: 'Lingvist', path: '/lingvist', icon: BookOpen },
  { label: 'Scripts', path: '/scripts', icon: ListMusic },
  { label: 'Live', path: '/live', icon: AudioLines },
  { label: 'Plus', path: '/plus', icon: LayoutGrid },
];

const TAB_PATHS = new Set(NAVIGATION.map((item) => item.path));

/** Écrans de session plein écran : la navigation s'efface pour favoriser la concentration. */
const IMMERSIVE_ROUTES = ['/flashcards', '/lingvist-triage', '/phrases', '/lingvist'];

function currentNavigationPath(pathname: string) {
  return NAVIGATION.find((item) => item.path === pathname)?.path ?? '/plus';
}

/** Vrai tant qu'un champ texte a le focus (clavier virtuel ouvert sur mobile). */
function useTypingFocus() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (target: EventTarget | null) =>
      target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    const onIn = (event: FocusEvent) => { if (isField(event.target)) setTyping(true); };
    const onOut = () => window.setTimeout(() => setTyping(isField(document.activeElement)), 60);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);
  return typing;
}

export function AppShell() {
  const mode = useAdaptiveLayout();
  const online = useNetworkStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const typing = useTypingFocus();
  const compact = mode === 'compact';
  const active = currentNavigationPath(location.pathname);
  const immersive = IMMERSIVE_ROUTES.includes(location.pathname);
  const showTabBar = compact && !immersive && !typing;
  // Un onglet apparaît en fondu ; un écran ouvert depuis un onglet glisse depuis la droite, comme sur iOS.
  const pushed = !TAB_PATHS.has(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const go = (path: string) => {
    if (path !== location.pathname) feedback('select');
    navigate(path);
  };

  return (
    <div
      className="relative min-h-dvh"
      style={{ '--content-left': compact ? '0px' : `${APP_LAYOUT.railWidth}px` } as React.CSSProperties}
    >
      <XpToaster />
      {/* Lueur d'aurore en haut de chaque écran : un peu de couleur et de mouvement, fondue vers le bas. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[360px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)] dark:opacity-30">
        <Aurora intensity={0.55} />
      </div>

      <AnimatePresence>
        {!online ? (
          <motion.div
            initial={{ y: -40 }} animate={{ y: 0 }} exit={{ y: -40 }}
            className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-glass pb-1.5 pt-[max(6px,env(safe-area-inset-top))] text-[13px] font-semibold text-muted backdrop-blur-xl"
          >
            <CloudOff className="size-4" /> Hors connexion
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!compact ? (
        <nav
          aria-label="Navigation principale"
          className="fixed inset-y-0 left-0 z-10 flex flex-col items-center gap-1 border-r border-border bg-glass pt-[max(20px,env(safe-area-inset-top))] backdrop-blur-xl"
          style={{ width: APP_LAYOUT.railWidth }}
        >
          {NAVIGATION.map(({ label, path, icon: Icon }) => {
            const selected = active === path;
            return (
              <button
                type="button"
                key={path}
                aria-current={selected ? 'page' : undefined}
                onClick={() => go(path)}
                className={cn(
                  'relative flex min-h-[60px] w-[76px] flex-col items-center justify-center gap-1 rounded-xl transition-colors',
                  selected ? 'text-violet' : 'text-muted hover:text-fg',
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId="rail-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    className="absolute inset-0 rounded-xl bg-violet/10"
                  />
                ) : null}
                <Icon className="relative size-6" />
                <span className="relative text-[11px] font-medium">{label}</span>
              </button>
            );
          })}
        </nav>
      ) : null}

      <main
        className="relative z-[1] min-h-dvh"
        style={{
          marginLeft: 'var(--content-left)',
          paddingBottom: showTabBar ? `calc(${APP_LAYOUT.bottomNavHeight + 24}px + env(safe-area-inset-bottom))` : 0,
        }}
      >
        <motion.div
          key={location.pathname}
          initial={pushed ? { opacity: 0, x: 48 } : { opacity: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={pushed ? { type: 'spring', stiffness: 380, damping: 38 } : { duration: 0.22, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      <AnimatePresence>
        {showTabBar ? (
          <motion.nav
            aria-label="Navigation principale"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-20 flex rounded-[28px] border border-border bg-glass p-1.5 shadow-float backdrop-blur-2xl backdrop-saturate-150"
          >
            {NAVIGATION.map(({ label, path, icon: Icon }) => {
              const selected = active === path;
              return (
                <button
                  type="button"
                  key={path}
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => go(path)}
                  className={cn(
                    'relative flex h-[52px] flex-1 flex-col items-center justify-center gap-[3px] transition-colors duration-200',
                    selected ? 'text-violet' : 'text-muted',
                  )}
                >
                  {selected ? <motion.span layoutId="tab-pill" transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                    className="absolute inset-0 rounded-[22px] bg-violet/12" /> : null}
                  <motion.span
                    animate={selected ? { scale: [1, 0.86, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.38, ease: 'easeOut' }}
                    className="relative grid place-items-center"
                  >
                    <Icon className="size-[26px]" strokeWidth={selected ? 2.2 : 1.9} />
                  </motion.span>
                  <span className="relative text-[10px] font-semibold leading-none">{label}</span>
                </button>
              );
            })}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
