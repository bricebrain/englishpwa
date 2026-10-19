import { AudioLines, BookOpen, CloudOff, House, LayoutGrid, ListMusic, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { XpToaster } from '@/components/ui/Gamification';
import { spring } from '@/components/ui/springs';
import { APP_LAYOUT } from '@/constants/layout';
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';
import { tokens } from '@/theme';

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const NAVIGATION: NavigationItem[] = [
  { label: 'Accueil', path: '/', icon: House },
  { label: 'Lingvist', path: '/lingvist', icon: BookOpen },
  { label: 'Scripts', path: '/scripts', icon: ListMusic },
  { label: 'Live', path: '/live', icon: AudioLines },
  { label: 'Plus', path: '/plus', icon: LayoutGrid },
];

/** Écrans de session plein écran : la navigation s'efface pour favoriser la concentration. */
const IMMERSIVE_ROUTES = ['/flashcards', '/lingvist-triage', '/phrases'];

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
  const showBottomNav = compact && !immersive && !typing;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const go = (path: string) => {
    if (path !== location.pathname) feedback('select');
    navigate(path);
  };

  return (
    <div className="relative min-h-dvh">
      <div className="aurora" aria-hidden><span /></div>
      <div className="grain" aria-hidden />
      <XpToaster />

      <AnimatePresence>
        {!online ? (
          <motion.div
            initial={{ y: -40 }} animate={{ y: 0 }} exit={{ y: -40 }}
            className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-amber/15 pb-1.5 pt-[max(6px,env(safe-area-inset-top))] text-[13px] font-bold text-amber backdrop-blur-md"
          >
            <CloudOff className="size-[18px]" /> Hors connexion
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!compact ? (
        <nav
          aria-label="Navigation principale"
          className="fixed inset-y-0 left-0 z-10 border-r border-border bg-glass pt-[max(20px,env(safe-area-inset-top))] backdrop-blur-xl backdrop-saturate-150"
          style={{ width: APP_LAYOUT.railWidth }}
        >
          <div className="flex flex-col items-center gap-2">
            <img
              src="/icons/icon-192.png"
              alt=""
              className="mb-3 size-11 rounded-xl"
              style={{ boxShadow: `0 8px 24px -8px ${tokens.violet}` }}
            />
            {NAVIGATION.map(({ label, path, icon: Icon }) => {
              const selected = active === path;
              return (
                <button
                  type="button"
                  key={path}
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => go(path)}
                  className={cn(
                    'relative flex min-h-[62px] w-[72px] flex-col items-center justify-center gap-1 rounded-2xl transition-colors',
                    selected ? 'text-violet' : 'text-muted hover:text-fg',
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="rail-indicator"
                      transition={spring}
                      className="absolute inset-0 rounded-2xl border border-violet/35 bg-violet/15"
                    />
                  ) : null}
                  <Icon className="relative size-6" strokeWidth={selected ? 2.4 : 2} />
                  <span className={cn('relative text-[11px]', selected ? 'font-extrabold' : 'font-semibold')}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}

      <main
        className="relative z-[1] min-h-dvh"
        style={{
          marginLeft: compact ? 0 : APP_LAYOUT.railWidth,
          paddingBottom: compact && !immersive ? `calc(${APP_LAYOUT.bottomNavHeight + 28}px + env(safe-area-inset-bottom))` : 0,
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <AnimatePresence>
        {showBottomNav ? (
          <motion.nav
            aria-label="Navigation principale"
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={spring}
            className="fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-20 flex items-center rounded-[26px] border border-border-strong bg-glass px-1.5 shadow-float backdrop-blur-xl backdrop-saturate-150"
            style={{ height: APP_LAYOUT.bottomNavHeight }}
          >
            {NAVIGATION.map(({ label, path, icon: Icon }) => {
              const selected = active === path;
              return (
                <button
                  type="button"
                  key={path}
                  aria-current={selected ? 'page' : undefined}
                  aria-label={label}
                  onClick={() => go(path)}
                  className={cn(
                    'relative flex h-[58px] flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
                    selected ? 'text-white' : 'text-muted',
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="nav-indicator"
                      transition={spring}
                      className="absolute inset-x-1 inset-y-0.5 rounded-[20px] bg-grad-primary"
                      style={{ boxShadow: `0 8px 22px -8px ${tokens.violet}` }}
                    />
                  ) : null}
                  <motion.span
                    animate={{ y: selected ? -1 : 0, scale: selected ? 1.08 : 1 }}
                    transition={spring}
                    className="relative grid place-items-center"
                  >
                    <Icon className="size-6" strokeWidth={selected ? 2.4 : 2} />
                  </motion.span>
                  <span className={cn('relative text-[10.5px] leading-none', selected ? 'font-extrabold' : 'font-semibold')}>{label}</span>
                </button>
              );
            })}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
