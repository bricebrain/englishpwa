import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import CloudOffRounded from '@mui/icons-material/CloudOffRounded';
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded';
import GridViewRounded from '@mui/icons-material/GridViewRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import LibraryMusicRounded from '@mui/icons-material/LibraryMusicRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { XpToaster } from '@/components/ui/Gamification';
import { MotionBox } from '@/components/ui/motion';
import { spring } from '@/components/ui/springs';
import { APP_LAYOUT } from '@/constants/layout';
import { useAdaptiveLayout } from '@/hooks/useAdaptiveLayout';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { feedback } from '@/services/feedbackService';
import { gradients, tokens } from '@/theme';

interface NavigationItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

const NAVIGATION: NavigationItem[] = [
  { label: 'Accueil', path: '/', icon: HomeRounded },
  { label: 'Lingvist', path: '/lingvist', icon: AutoStoriesRounded },
  { label: 'Scripts', path: '/scripts', icon: LibraryMusicRounded },
  { label: 'Live', path: '/live', icon: GraphicEqRounded },
  { label: 'Plus', path: '/plus', icon: GridViewRounded },
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
    <Box minHeight="100dvh" position="relative">
      <div className="aurora" aria-hidden><span /></div>
      <div className="grain" aria-hidden />
      <XpToaster />

      <AnimatePresence>
        {!online ? (
          <MotionBox
            initial={{ y: -40 }} animate={{ y: 0 }} exit={{ y: -40 }}
            sx={{
              position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              py: 0.75, pt: 'max(6px, env(safe-area-inset-top))', background: 'rgba(255,181,71,0.15)', backdropFilter: 'blur(12px)',
              color: tokens.amber, fontSize: 13, fontWeight: 700,
            }}
          >
            <CloudOffRounded sx={{ fontSize: 18 }} /> Hors connexion
          </MotionBox>
        ) : null}
      </AnimatePresence>

      {!compact ? (
        <Box
          component="nav"
          aria-label="Navigation principale"
          sx={{
            position: 'fixed', inset: '0 auto 0 0', width: APP_LAYOUT.railWidth, zIndex: 10,
            pt: 'max(20px, env(safe-area-inset-top))',
            background: 'rgba(18,17,29,0.6)', backdropFilter: 'blur(24px) saturate(1.4)',
            borderRight: `1px solid ${tokens.border}`,
          }}
        >
          <Stack alignItems="center" gap={1}>
            <Box
              component="img"
              src="/icons/icon-192.png"
              alt=""
              sx={{ width: 44, height: 44, borderRadius: 3, mb: 1.5, boxShadow: `0 8px 24px -8px ${tokens.violet}` }}
            />
            {NAVIGATION.map(({ label, path, icon: Icon }) => {
              const selected = active === path;
              return (
                <Box
                  component="button"
                  key={path}
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => go(path)}
                  sx={{
                    position: 'relative', width: 72, minHeight: 62, border: 0, borderRadius: 4, cursor: 'pointer',
                    background: 'transparent', color: selected ? '#fff' : 'text.secondary',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.4,
                  }}
                >
                  {selected ? (
                    <MotionBox
                      layoutId="rail-indicator"
                      transition={spring}
                      sx={{ position: 'absolute', inset: 0, borderRadius: 4, background: 'rgba(139,108,255,0.18)', border: '1px solid rgba(139,108,255,0.35)' }}
                    />
                  ) : null}
                  <Icon sx={{ position: 'relative', fontSize: 24, color: selected ? tokens.violetSoft : undefined }} />
                  <Typography position="relative" fontSize={11} fontWeight={selected ? 800 : 600}>{label}</Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ) : null}

      <Box
        component="main"
        sx={{
          position: 'relative', zIndex: 1,
          ml: compact ? 0 : `${APP_LAYOUT.railWidth}px`,
          pb: compact && !immersive ? `calc(${APP_LAYOUT.bottomNavHeight + 28}px + env(safe-area-inset-bottom))` : 0,
          minHeight: '100dvh',
        }}
      >
        <MotionBox
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </MotionBox>
      </Box>

      <AnimatePresence>
        {showBottomNav ? (
          <MotionBox
            component="nav"
            aria-label="Navigation principale"
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={spring}
            sx={{
              position: 'fixed', left: 12, right: 12, zIndex: 20,
              bottom: 'calc(10px + env(safe-area-inset-bottom))',
              height: APP_LAYOUT.bottomNavHeight, borderRadius: '26px', px: 0.75,
              display: 'flex', alignItems: 'center',
              background: 'rgba(22,20,36,0.78)', backdropFilter: 'blur(24px) saturate(1.6)',
              border: `1px solid ${tokens.borderStrong}`,
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {NAVIGATION.map(({ label, path, icon: Icon }) => {
              const selected = active === path;
              return (
                <Box
                  component="button"
                  key={path}
                  aria-current={selected ? 'page' : undefined}
                  aria-label={label}
                  onClick={() => go(path)}
                  sx={{
                    position: 'relative', flex: 1, height: 58, border: 0, background: 'transparent', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.25,
                    color: selected ? '#fff' : tokens.textMuted, WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {selected ? (
                    <MotionBox
                      layoutId="nav-indicator"
                      transition={spring}
                      sx={{ position: 'absolute', inset: '2px 4px', borderRadius: '20px', background: gradients.primary, boxShadow: `0 8px 22px -8px ${tokens.violet}` }}
                    />
                  ) : null}
                  <motion.span
                    animate={{ y: selected ? -1 : 0, scale: selected ? 1.08 : 1 }}
                    transition={spring}
                    style={{ position: 'relative', display: 'grid', placeItems: 'center' }}
                  >
                    <Icon sx={{ fontSize: 24 }} />
                  </motion.span>
                  <Typography position="relative" fontSize={10.5} fontWeight={selected ? 800 : 600} lineHeight={1}>{label}</Typography>
                </Box>
              );
            })}
          </MotionBox>
        ) : null}
      </AnimatePresence>
    </Box>
  );
}
