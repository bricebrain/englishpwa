import { BookOpen, Check, ChevronRight, Hammer, MessagesSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Pressable } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { tokens } from '@/theme';

interface DailyMissionCardProps {
  reviewedToday: number;
  dueCount: number;
}

const steps = [
  { label: 'Mots à renforcer', path: '/lingvist', icon: BookOpen, minutes: 7 },
  { label: 'Construire une phrase utile', path: '/phrases', icon: Hammer, minutes: 5 },
  { label: 'Préparer une séance Live', path: '/live', icon: MessagesSquare, minutes: 3 },
];

/** Parcours du jour façon « chemin » : étapes reliées, l'étape active pulse. */
export function DailyMissionCard({ reviewedToday, dueCount }: DailyMissionCardProps) {
  const navigate = useNavigate();
  const wordsDone = reviewedToday >= 10;

  return (
    <Card>
      <CardContent className="p-[18px] sm:p-6">
        <div className="mb-4">
          <span className="type-overline text-violet-soft">Mission du jour · 15 min</span>
          <h2 className="type-h2">{wordsDone ? 'Plus que 2 étapes' : '3 étapes aujourd’hui'}</h2>
        </div>

        <div className="relative">
          <div className="absolute bottom-[30px] left-[25px] top-[30px] w-[3px] rounded-full bg-ink/8" />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: wordsDone ? '50%' : '0%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="absolute left-[25px] top-[30px] w-[3px] rounded-full bg-grad-mint"
          />
          <div className="flex flex-col gap-2">
            {steps.map(({ label, path, icon: Icon, minutes }, index) => {
              const done = index === 0 && wordsDone;
              const active = index === 0 ? !wordsDone : index === 1 && wordsDone;
              return (
                <Pressable key={path} onClick={() => navigate(path)} aria-label={label}>
                  <div
                    className={cn(
                      'flex items-center gap-3.5 rounded-2xl border p-1 pr-2.5',
                      active ? 'border-violet/30 bg-violet/10' : 'border-transparent',
                    )}
                  >
                    <div className="relative size-[46px] shrink-0">
                      {active ? (
                        <motion.span
                          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-full bg-violet"
                        />
                      ) : null}
                      <span
                        className={cn(
                          'relative grid size-[46px] place-items-center rounded-full',
                          done ? 'bg-grad-mint text-[#06140E]' : active ? 'bg-grad-primary text-white' : 'border border-border bg-surface-high text-muted',
                        )}
                        style={active ? { boxShadow: `0 8px 24px -8px ${tokens.violet}` } : undefined}
                      >
                        {done ? <Check className="size-6" /> : <Icon className="size-[22px]" />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('font-bold', done && 'line-through opacity-55')}>
                        {index === 0 ? `${Math.max(dueCount, 10)} mots à renforcer` : label}
                      </p>
                      <p className={cn('text-xs font-bold', active ? 'text-amber' : 'text-faint')}>{done ? 'Terminé' : `≈ ${minutes} min`}</p>
                    </div>
                    <ChevronRight className={cn('size-6', active ? 'text-violet-soft' : 'text-faint')} />
                  </div>
                </Pressable>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
