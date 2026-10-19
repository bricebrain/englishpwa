import { Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { spring } from '@/components/ui/springs';
import { useXp } from '@/hooks/useXp';
import { celebrate, feedback } from '@/services/feedbackService';
import type { XpGain } from '@/services/xpService';
import { tokens } from '@/theme';

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
          <stop offset="0%" stopColor="#D83E88" />
          <stop offset="55%" stopColor="#E85F43" />
          <stop offset="100%" stopColor="#E09A2A" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E09A2A" />
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
    <div
      className="inline-flex h-[38px] items-center gap-1 rounded-full border border-coral/30 bg-coral/12 pl-1.5 pr-2.5"
      aria-label={`${days} jours de suite`}
    >
      <Flame size={24} active={days > 0} />
      <span className="font-display text-[17px] font-extrabold text-amber">{days}</span>
    </div>
  );
}

export function LevelBadge({ compact = false }: { compact?: boolean }) {
  const xp = useXp();
  return (
    <div
      className={`inline-flex h-[38px] items-center gap-1.5 rounded-full border border-violet/30 bg-violet/12 pl-1 ${compact ? 'pr-2' : 'pr-2.5'}`}
      aria-label={`Niveau ${xp.level}, ${xp.totalXp} XP`}
    >
      <span className="grid size-7 place-items-center rounded-full bg-grad-primary font-display text-[13px] font-extrabold text-white">{xp.level}</span>
      {!compact ? (
        <span className="block w-[42px]">
          <span className="block h-[5px] overflow-hidden rounded-full bg-ink/10">
            <motion.span
              className="block h-full rounded-full bg-grad-primary"
              initial={{ width: 0 }}
              animate={{ width: `${xp.progress * 100}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </span>
        </span>
      ) : null}
    </div>
  );
}

/** Badge « combo » qui rebondit à chaque nouvelle bonne réponse consécutive. */
export function ComboBadge({ combo }: { combo: number }) {
  return (
    <AnimatePresence>
      {combo >= 2 ? (
        <motion.div
          key={combo}
          initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          className="inline-flex h-[30px] items-center gap-0.5 rounded-full bg-grad-sunrise px-2 text-white"
          style={{ boxShadow: `0 6px 20px -6px ${tokens.coral}` }}
        >
          <Zap className="size-4 fill-current" />
          <span className="font-display text-sm font-extrabold">×{combo}</span>
        </motion.div>
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
      <div className="pointer-events-none fixed inset-x-0 top-[max(14px,env(safe-area-inset-top))] z-[1400] flex justify-center">
        <AnimatePresence>
          {gains.map((gain) => (
            <motion.div
              key={gain.id}
              initial={{ y: -30, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -24, opacity: 0, scale: 0.8 }}
              transition={spring}
              className="absolute flex items-center gap-1 rounded-full border border-border-strong bg-glass px-3 py-1.5 shadow-float backdrop-blur-md"
            >
              <Zap className="size-[18px] fill-current text-amber" />
              <span className="text-gradient font-display text-[15px] font-extrabold">+{gain.amount} XP</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {levelUp ? (
          <motion.div
            key="level-up"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLevelUp(null)}
            className="fixed inset-0 z-[1500] grid place-items-center p-6 backdrop-blur-[10px]"
            style={{ background: 'var(--scrim)' }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
              className="text-center"
            >
              <div
                className="mx-auto grid size-[132px] place-items-center rounded-[36%] bg-grad-primary"
                style={{ boxShadow: `0 20px 60px -10px ${tokens.violet}` }}
              >
                <span className="font-display text-[64px] font-extrabold leading-none text-white">{levelUp}</span>
              </div>
              <h2 className="type-h1 mt-6">Niveau {levelUp} !</h2>
              <p className="mt-2 text-muted">Ta régularité paie. Continue sur cette lancée.</p>
              <p className="mt-8 text-[13px] text-faint">Touchez pour continuer</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
