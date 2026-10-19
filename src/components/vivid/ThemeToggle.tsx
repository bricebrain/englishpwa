import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';

/**
 * Bascule Clair ↔ Sombre en un geste, visible dès l'accueil (le choix « Système » reste dans Réglages).
 * Le soleil et la lune tournent l'un dans l'autre.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setPreference } = useTheme();
  const dark = resolved === 'dark';
  return <motion.button type="button" whileTap={{ scale: 0.88 }} aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
    title={dark ? 'Thème clair' : 'Thème sombre'}
    onClick={() => { feedback('tap'); setPreference(dark ? 'light' : 'dark'); }}
    className={cn('relative grid size-9 place-items-center overflow-hidden rounded-full bg-ink/10 text-fg', className)}>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span key={dark ? 'moon' : 'sun'} initial={{ rotate: -90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }} className="grid place-items-center">
        {dark ? <Moon className="size-[18px] fill-current text-amber" /> : <Sun className="size-[19px] text-amber" />}
      </motion.span>
    </AnimatePresence>
  </motion.button>;
}
