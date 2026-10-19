import { motion } from 'motion/react';

import { Flame } from '@/components/ui/Gamification';
import { cn } from '@/lib/utils';

const LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function WeekStrip({ activeDays }: { activeDays: boolean[] }) {
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex justify-between" aria-label="Activité des sept derniers jours">
      {LABELS.map((label, index) => {
        const active = activeDays[index];
        const today = index === todayIndex;
        return (
          <div key={`${label}-${index}`} className="flex flex-col items-center gap-1.5">
            <span className={cn('text-[11.5px] font-extrabold', today ? 'text-violet-soft' : 'text-faint')}>{label}</span>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 + index * 0.05 }}
              className={cn(
                'grid size-9 place-items-center rounded-xl',
                active ? 'bg-coral/14' : 'bg-ink/[0.045]',
                today ? 'border-2 border-violet' : active ? 'border border-coral/30' : 'border border-border',
              )}
            >
              {active ? <Flame size={20} animated={today} /> : <span className="size-1.5 rounded-full bg-faint" />}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
