import { RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, IconButton } from '@/components/ui/button';
import { ComboBadge } from '@/components/ui/Gamification';
import { AnimatedNumber } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { softSpring } from '@/components/ui/springs';
import { cn } from '@/lib/utils';
import { celebrate, feedback } from '@/services/feedbackService';
import { gradients, tokens } from '@/theme';

/** Barre supérieure des sessions d'entraînement : fermer, progression animée, combo. */
export function SessionHeader({ progress, combo = 0, label, onClose, action }: {
  progress: number;
  combo?: number;
  label?: string;
  onClose?: () => void;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <IconButton aria-label="Quitter la session" onClick={onClose ?? (() => navigate(-1))} className="-ml-2">
        <X />
      </IconButton>
      <div className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-ink/8">
        <motion.div
          initial={false}
          animate={{ width: `${Math.max(4, Math.min(100, progress * 100))}%` }}
          transition={softSpring}
          className="absolute inset-y-0 left-0 rounded-full bg-grad-mint"
          style={{ boxShadow: `0 0 16px ${tokens.mint}` }}
        >
          <span className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/45" />
        </motion.div>
      </div>
      {label ? <span className="text-[13px] font-extrabold tabular-nums text-muted">{label}</span> : null}
      <ComboBadge combo={combo} />
      {action}
    </div>
  );
}

export type ResultTone = 'success' | 'almost' | 'error' | 'neutral';

const RESULT_STYLES: Record<ResultTone, { text: string; panel: string; badge: string }> = {
  success: { text: 'text-mint', panel: 'bg-mint/10 border-mint/35', badge: 'bg-mint' },
  almost: { text: 'text-amber', panel: 'bg-amber/10 border-amber/35', badge: 'bg-amber' },
  error: { text: 'text-red', panel: 'bg-red/10 border-red/35', badge: 'bg-red' },
  neutral: { text: 'text-violet-soft', panel: 'bg-violet/10 border-violet/35', badge: 'bg-violet-soft' },
};

/** Panneau de résultat qui « monte » avec un petit rebond, coloré selon la réussite. */
export function ResultPanel({ tone, title, icon, children }: { tone: ResultTone; title: string; icon?: ReactNode; children?: ReactNode }) {
  const style = RESULT_STYLES[tone];
  return (
    <motion.div
      initial={{ y: 30, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className={cn('rounded-[20px] border-[1.5px] p-4', style.panel)}
    >
      <div className="flex items-center gap-2.5">
        {icon ? (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.08 }}
            className={cn('grid size-[38px] shrink-0 place-items-center rounded-full text-bg [&_svg]:size-[22px] [&_svg]:stroke-[2.6]', style.badge)}
          >
            {icon}
          </motion.span>
        ) : null}
        <span className={cn('font-display text-[21px] font-extrabold', style.text)}>{title}</span>
      </div>
      {children ? <div className="mt-2.5">{children}</div> : null}
    </motion.div>
  );
}

/** Écran de fin de session : anneau de score, compteurs animés, confettis. */
export function CelebrationCard({ title, subtitle, score, stats, onRestart, restartLabel = 'Nouvelle session' }: {
  title: string;
  subtitle?: string;
  score: number; // 0 → 1
  stats: { label: string; value: number; suffix?: string; color?: string }[];
  onRestart?: () => void;
  restartLabel?: string;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    feedback('complete');
    void celebrate(score >= 0.6 ? 'big' : 'small');
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={softSpring}
      className="mx-auto max-w-[560px] pt-6 text-center sm:pt-12"
    >
      <div className="flex justify-center">
        <ProgressRing value={score} size={168} stroke={14} colors={[tokens.lime, tokens.mint]}>
          <div>
            <p className="font-display text-[44px] font-extrabold leading-none">
              <AnimatedNumber value={Math.round(score * 100)} suffix="%" />
            </p>
            <p className="text-xs font-bold text-muted">réussite</p>
          </div>
        </ProgressRing>
      </div>
      <h1 className="type-h1 mt-6">{title}</h1>
      {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}

      <div className="mt-7 flex justify-center gap-2.5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...softSpring, delay: 0.35 + index * 0.08 }}
            className="max-w-40 flex-1 rounded-2xl border border-border bg-ink/[0.045] py-4"
          >
            <p className="font-display text-[28px] font-extrabold" style={{ color: stat.color ?? tokens.text }}>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs font-bold text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2.5">
        {onRestart ? (
          <Button size="lg" onClick={onRestart}><RotateCcw />{restartLabel}</Button>
        ) : null}
        <Button size="lg" variant="outline" onClick={() => navigate('/')}>Retour à l’accueil</Button>
      </div>
    </motion.div>
  );
}

/** Pastille d'icône colorée en dégradé. */
export function IconTile({ icon, gradient = gradients.primary, size = 44, radius = 14 }: { icon: ReactNode; gradient?: string; size?: number; radius?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center text-white shadow-[0_8px_20px_-10px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.3)] [&_svg]:size-[var(--icon-size)]"
      style={{ width: size, height: size, borderRadius: radius, background: gradient, '--icon-size': `${Math.round(size * 0.5)}px` } as React.CSSProperties}
    >
      {icon}
    </span>
  );
}
