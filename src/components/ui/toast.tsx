import { AnimatePresence, motion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';

/** Bannière brève qui glisse depuis le haut, masquée automatiquement. */
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
          initial={{ y: -80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="fixed inset-x-4 top-[max(12px,env(safe-area-inset-top))] z-[1300] mx-auto flex max-w-sm items-center gap-3 rounded-full bg-glass px-5 py-3 text-[15px] font-semibold text-fg shadow-float backdrop-blur-xl"
        >
          <span className="min-w-0 flex-1 text-center">{message}</span>
          {action}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
