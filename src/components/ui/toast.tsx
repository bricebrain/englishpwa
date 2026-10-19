import { AnimatePresence, motion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';

import { spring } from '@/components/ui/springs';

/** Message bref affiché au-dessus de la navigation, masqué automatiquement. */
export function Toast({ open, message, onClose, duration = 2500, action }: {
  open: boolean;
  message: ReactNode;
  onClose: () => void;
  duration?: number | null;
  action?: ReactNode;
}) {
  useEffect(() => {
    if (!open || duration === null) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="status"
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.95 }}
          transition={spring}
          className="fixed inset-x-4 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[1300] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border-strong bg-surface-high px-4 py-3 font-semibold text-fg shadow-float"
        >
          <span className="min-w-0 flex-1">{message}</span>
          {action}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
