import BoltRounded from '@mui/icons-material/BoltRounded';
import { Box, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { MotionBox } from '@/components/ui/motion';
import { spring } from '@/components/ui/springs';
import { useXp } from '@/hooks/useXp';
import { celebrate, feedback } from '@/services/feedbackService';
import type { XpGain } from '@/services/xpService';
import { displayFont, gradients, tokens } from '@/theme';

/** Flamme SVG animée (vacillement continu). */
export function Flame({ size = 22, active = true, animated = active }: { size?: number; active?: boolean; animated?: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      animate={animated ? { scale: [1, 1.08, 0.97, 1.05, 1], rotate: [0, -3, 2, -1, 0] } : undefined}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '50% 90%', filter: active ? `drop-shadow(0 0 6px ${tokens.coral})` : 'grayscale(1)' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={tokens.pink} />
          <stop offset="55%" stopColor={tokens.coral} />
          <stop offset="100%" stopColor={tokens.amber} />
        </linearGradient>
        <linearGradient id="flame-inner" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={tokens.amber} />
          <stop offset="100%" stopColor="#FFF3C4" />
        </linearGradient>
      </defs>
      <path d="M12 1.5c.6 3.3 3 5 4.6 7.2A8 8 0 0 1 20 13.6 8 8 0 1 1 4 13.6c0-2.6 1.1-4.4 2.5-5.9.3 1.7 1.2 2.9 2.4 3.4C8.5 7.3 10 4 12 1.5Z" fill="url(#flame-outer)" />
      <path d="M12 11c.4 1.7 1.8 2.6 2.6 3.8a3.6 3.6 0 1 1-6.1 1.4c.3-1 1-1.8 1.7-2.4.1.8.6 1.3 1.1 1.5-.2-1.6.1-3.1.7-4.3Z" fill="url(#flame-inner)" />
    </motion.svg>
  );
}

export function StreakBadge({ days }: { days: number }) {
  return (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5, pl: 0.75, pr: 1.25, height: 38, borderRadius: 99,
        background: 'rgba(255,122,89,0.12)', border: '1px solid rgba(255,122,89,0.3)',
      }}
      aria-label={`${days} jours de suite`}
    >
      <Flame size={24} active={days > 0} />
      <Typography fontFamily={displayFont} fontWeight={800} fontSize={17} color={tokens.amber}>{days}</Typography>
    </Box>
  );
}

export function LevelBadge({ compact = false }: { compact?: boolean }) {
  const xp = useXp();
  return (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.75, pl: 0.5, pr: compact ? 1 : 1.25, height: 38, borderRadius: 99,
        background: 'rgba(139,108,255,0.12)', border: '1px solid rgba(139,108,255,0.3)',
      }}
      aria-label={`Niveau ${xp.level}, ${xp.totalXp} XP`}
    >
      <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', background: gradients.primary }}>
        <Typography fontFamily={displayFont} fontWeight={800} fontSize={13} color="#fff">{xp.level}</Typography>
      </Box>
      {!compact ? (
        <Box width={42}>
          <Box sx={{ height: 5, borderRadius: 9, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <MotionBox
              sx={{ height: '100%', background: gradients.primary, borderRadius: 9 }}
              initial={{ width: 0 }}
              animate={{ width: `${xp.progress * 100}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

/** Badge « combo » qui rebondit à chaque nouvelle bonne réponse consécutive. */
export function ComboBadge({ combo }: { combo: number }) {
  return (
    <AnimatePresence>
      {combo >= 2 ? (
        <MotionBox
          key={combo}
          initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.25, px: 1.1, height: 30, borderRadius: 99,
            background: gradients.sunrise, boxShadow: `0 6px 20px -6px ${tokens.coral}`,
          }}
        >
          <BoltRounded sx={{ fontSize: 17, color: '#fff' }} />
          <Typography fontFamily={displayFont} fontWeight={800} fontSize={14} color="#fff">×{combo}</Typography>
        </MotionBox>
      ) : null}
    </AnimatePresence>
  );
}

/** Notifications flottantes « +12 XP » et passage de niveau, montées une seule fois dans l'AppShell. */
export function XpToaster() {
  const { lastGain } = useXp();
  const [gains, setGains] = useState<XpGain[]>([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const seen = useRef<number | null>(null);

  useEffect(() => {
    if (!lastGain || seen.current === lastGain.id) return;
    seen.current = lastGain.id;
    setGains((current) => [...current.slice(-2), lastGain]);
    const timer = window.setTimeout(() => setGains((current) => current.filter((gain) => gain.id !== lastGain.id)), 1400);
    if (lastGain.leveledUpTo) {
      setLevelUp(lastGain.leveledUpTo);
      feedback('levelUp');
      void celebrate('big');
    }
    return () => window.clearTimeout(timer);
  }, [lastGain]);

  return (
    <>
      <Box sx={{ position: 'fixed', top: 'max(14px, env(safe-area-inset-top))', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1400, pointerEvents: 'none' }}>
        <AnimatePresence>
          {gains.map((gain) => (
            <MotionBox
              key={gain.id}
              initial={{ y: -30, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -24, opacity: 0, scale: 0.8 }}
              transition={spring}
              sx={{
                position: 'absolute', display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.6, borderRadius: 99,
                background: 'rgba(26,24,40,0.92)', backdropFilter: 'blur(12px)', border: `1px solid ${tokens.borderStrong}`,
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)',
              }}
            >
              <BoltRounded sx={{ fontSize: 18, color: tokens.amber }} />
              <Typography fontFamily={displayFont} fontWeight={800} fontSize={15} className="text-gradient">+{gain.amount} XP</Typography>
            </MotionBox>
          ))}
        </AnimatePresence>
      </Box>

      <AnimatePresence>
        {levelUp ? (
          <MotionBox
            key="level-up"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLevelUp(null)}
            sx={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'grid', placeItems: 'center', background: 'rgba(4,3,10,0.72)', backdropFilter: 'blur(10px)', p: 3 }}
          >
            <MotionBox
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
              sx={{ textAlign: 'center' }}
            >
              <Box sx={{ width: 132, height: 132, mx: 'auto', borderRadius: '36%', display: 'grid', placeItems: 'center', background: gradients.primary, boxShadow: `0 20px 60px -10px ${tokens.violet}` }}>
                <Typography fontFamily={displayFont} fontWeight={800} fontSize={64} color="#fff" lineHeight={1}>{levelUp}</Typography>
              </Box>
              <Typography variant="h1" mt={3}>Niveau {levelUp} !</Typography>
              <Typography color="text.secondary" mt={1}>Ta régularité paie. Continue sur cette lancée.</Typography>
              <Typography color="text.disabled" fontSize={13} mt={4}>Touchez pour continuer</Typography>
            </MotionBox>
          </MotionBox>
        ) : null}
      </AnimatePresence>
    </>
  );
}
