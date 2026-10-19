import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';

/** Titre de section d'une liste groupée (petites capitales grises). */
export function SectionHeader({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-2.5 mt-8 flex items-end justify-between gap-2 px-1', className)}>
      <h2 className="text-[21px] font-bold leading-tight tracking-[-0.02em] text-fg">{children}</h2>
      {action}
    </div>
  );
}

export function SectionFooter({ children }: { children: ReactNode }) {
  return <p className="mt-[7px] px-4 text-[13px] leading-[18px] text-muted">{children}</p>;
}

/** Carte arrondie qui regroupe des lignes séparées par un trait fin ; elle monte doucement en entrant à l'écran. */
export function ListGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -6% 0px' }}
    transition={{ type: 'spring', stiffness: 190, damping: 24 }}
    className={cn('overflow-hidden rounded-[22px] bg-surface shadow-card transition-colors duration-300', className)}>{children}</motion.div>;
}

/** Pastille d'icône carrée façon Réglages iOS. */
export function RowIcon({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] text-white shadow-[0_6px_14px_-6px_rgb(0_0_0/0.35)] [&_svg]:size-[18px]"
      style={{ background: `linear-gradient(140deg, color-mix(in srgb, ${color} 72%, white) 0%, ${color} 55%, color-mix(in srgb, ${color} 85%, black) 100%)` }}>
      {children}
    </span>
  );
}

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  /** Dernière ligne : pas de séparateur. */
  last?: boolean;
  as?: 'button' | 'label' | 'div';
  className?: string;
  'aria-label'?: string;
}

/** Ligne de liste : icône, titre, détail, chevron. Se surligne à l'appui comme sur iOS. */
export function ListRow({ title, subtitle, icon, detail, trailing, chevron = false, onClick, last = false, as, className, ...aria }: ListRowProps) {
  const element = as ?? (onClick ? 'button' : 'div');
  const content = (
    <>
      {icon ? <span className="py-[11px]">{icon}</span> : null}
      <span className={cn('flex min-h-[52px] min-w-0 flex-1 items-center gap-2 py-2.5 pr-4', !last && 'border-b border-border')}>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[17px] leading-[22px]">{title}</span>
          {subtitle ? <span className="text-[13px] leading-[18px] text-muted">{subtitle}</span> : null}
        </span>
        {detail ? <span className="shrink-0 text-[15px] text-muted">{detail}</span> : null}
        {trailing}
        {chevron ? <ChevronRight className="size-[18px] shrink-0 text-chevron" strokeWidth={2.6} /> : null}
      </span>
    </>
  );
  const rowClass = cn('flex w-full items-center gap-3 pl-4 text-left', className);

  if (element === 'button') {
    return (
      <motion.button
        type="button"
        onClick={() => { feedback('tap'); onClick?.(); }}
        whileTap={{ backgroundColor: 'color-mix(in srgb, var(--ink) 12%, transparent)' }}
        transition={{ duration: 0.12 }}
        className={rowClass}
        {...aria}
      >
        {content}
      </motion.button>
    );
  }
  if (element === 'label') return <label className={cn(rowClass, 'cursor-pointer')}>{content}</label>;
  return <div className={rowClass}>{content}</div>;
}
