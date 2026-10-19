import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { useXp } from '@/hooks/useXp';
import { celebrate, feedback } from '@/services/feedbackService';
import type { XpGain } from '@/services/xpService';

/** Série de bonnes réponses, discrète : n'apparaît qu'à partir de 3. */
export function ComboBadge({ combo }: { combo: number }) {
  return (
    <AnimatePresence>
      {combo >= 3 ? (
        <motion.span
          key={combo}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="inline-flex h-7 items-center rounded-full bg-violet/12 px-2.5 text-[13px] font-semibold tabular-nums text-violet"
          aria-label={`${combo} bonnes réponses d’affilée`}
        >
          {combo} d’affilée
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

/** Indications « +12 XP » et passage de niveau, montées une seule fois dans l'AppShell. */
export function XpToaster() {
  const { lastGain } = useXp();
  const [gains, setGains] = useState<XpGain[]>([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const seen = useRef<number | null>(null);

  useEffect(() => {
    if (!lastGain || seen.current === lastGain.id) return;
    seen.current = lastGain.id;
    setGains((current) => [...current.slice(-1), lastGain]);
    const timer = window.setTimeout(() => setGains((current) => current.filter((gain) => gain.id !== lastGain.id)), 1300);
    if (lastGain.leveledUpTo) {
      setLevelUp(lastGain.leveledUpTo);
      feedback('levelUp');
      void celebrate('big');
    }
    return () => window.clearTimeout(timer);
  }, [lastGain]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-[max(10px,env(safe-area-inset-top))] z-[1400] flex justify-center">
        <AnimatePresence>
          {gains.map((gain) => (
            <motion.div
              key={gain.id}
              initial={{ y: -24, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute rounded-full bg-glass px-3.5 py-1.5 text-[13px] font-semibold tabular-nums text-violet shadow-float backdrop-blur-xl"
            >
              +{gain.amount} XP
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
            className="fixed inset-0 z-[1500] grid place-items-center p-6 backdrop-blur-md"
            style={{ background: 'var(--scrim)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="w-full max-w-xs rounded-3xl bg-surface p-8 text-center shadow-float"
            >
              <p className="text-[13px] uppercase text-muted">Nouveau niveau</p>
              <p className="mt-1 font-display text-[64px] font-bold leading-none tabular-nums text-violet">{levelUp}</p>
              <p className="mt-3 text-[15px] text-muted">Ta régularité paie.</p>
              <p className="mt-6 text-[13px] text-faint">Touche pour continuer</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
