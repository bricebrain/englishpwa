import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Contenu qui se déplie en hauteur (démonté une fois replié). */
export function Collapse({ in: open, children }: { in: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Section repliable avec un en-tête cliquable. */
export function Disclosure({ summary, defaultOpen = false, className, children }: {
  summary: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('rounded-[18px] border border-border bg-ink/[0.025]', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="min-w-0 flex-1">{summary}</span>
        <ChevronDown className={cn('size-5 shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <Collapse in={open}>
        <div className="px-4 pb-4">{children}</div>
      </Collapse>
    </div>
  );
}
