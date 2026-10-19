import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

const LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Sept pastilles, une par jour de la semaine : pleine si tu as pratiqué, cerclée pour aujourd'hui. */
export function WeekStrip({ activeDays }: { activeDays: boolean[] }) {
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex justify-between" aria-label="Activité de la semaine">
      {LABELS.map((label, index) => {
        const active = activeDays[index];
        const today = index === todayIndex;
        return (
          <div key={`${label}-${index}`} className="flex w-8 flex-col items-center gap-1.5">
            <span className={cn('text-xs', today ? 'font-semibold text-fg' : 'text-muted')}>{label}</span>
            <motion.span
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26, delay: 0.15 + index * 0.04 }}
              aria-label={active ? 'Pratiqué' : 'Pas de pratique'}
              className={cn(
                'block size-6 rounded-full',
                active ? (today ? 'bg-violet' : 'bg-violet/50') : 'border-2 border-ink/16',
                today && 'ring-2 ring-violet ring-offset-[3px] ring-offset-surface',
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
