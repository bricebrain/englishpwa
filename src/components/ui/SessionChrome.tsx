import { RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, IconButton } from '@/components/ui/button';
import { ComboBadge } from '@/components/ui/Gamification';
import { AnimatedNumber } from '@/components/ui/motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { cn } from '@/lib/utils';
import { celebrate, feedback } from '@/services/feedbackService';
import { gradients, tokens } from '@/theme';

/** Barre supérieure des sessions : fermer, titre, compteur et fine barre de progression. */
export function SessionHeader({ progress, combo = 0, label, title, onClose, action }: {
  progress: number;
  combo?: number;
  label?: string;
  title?: string;
  onClose?: () => void;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex min-h-11 items-center gap-3">
        <IconButton aria-label="Quitter la session" onClick={onClose ?? (() => navigate(-1))}>
          <X strokeWidth={2.6} />
        </IconButton>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          {title ? <span className="truncate text-[17px] font-semibold">{title}</span> : null}
          <ComboBadge combo={combo} />
        </div>
        {label ? <span className="min-w-12 text-right text-[15px] tabular-nums text-muted">{label}</span> : null}
        {action}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          initial={false}
          animate={{ width: `${Math.max(2, Math.min(100, progress * 100))}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 26 }}
          className="h-full rounded-full bg-grad-primary shadow-[0_0_12px_rgb(162_60_240/0.6)]"
        />
      </div>
    </div>
  );
}

export type ResultTone = 'success' | 'almost' | 'error' | 'neutral';

const RESULT_STYLES: Record<ResultTone, { text: string; panel: string; badge: string }> = {
  success: { text: 'text-mint', panel: 'bg-mint/10', badge: 'bg-mint' },
  almost: { text: 'text-amber', panel: 'bg-amber/10', badge: 'bg-amber' },
  error: { text: 'text-red', panel: 'bg-red/8', badge: 'bg-red' },
  neutral: { text: 'text-violet', panel: 'bg-violet/8', badge: 'bg-violet' },
};

/** Coche ou croix qui se trace, pour annoncer un résultat. */
export function DrawnMark({ kind }: { kind: 'check' | 'cross' }) {
  const draw = { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.35, ease: 'easeOut' as const, delay: 0.12 } };
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {kind === 'check'
        ? <motion.path d="M5 12.5 10 17.5 19 7" {...draw} />
        : <><motion.path d="M7 7 17 17" {...draw} /><motion.path d="M17 7 7 17" {...draw} transition={{ ...draw.transition, delay: 0.25 }} /></>}
    </svg>
  );
}

/** Panneau de résultat qui glisse doucement, teinté selon la réussite. */
export function ResultPanel({ tone, title, icon, children }: { tone: ResultTone; title: string; icon?: ReactNode; children?: ReactNode }) {
  const style = RESULT_STYLES[tone];
  const mark = icon ?? <DrawnMark kind={tone === 'error' ? 'cross' : 'check'} />;
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={cn('rounded-2xl p-4', style.panel)}
    >
      <div className="flex items-center gap-2.5">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.05 }}
          className={cn('grid size-8 shrink-0 place-items-center rounded-full text-bg [&_svg]:size-[18px] [&_svg]:stroke-[2.8]', style.badge)}
        >
          {mark}
        </motion.span>
        <span className={cn('text-[19px] font-semibold', style.text)}>{title}</span>
      </div>
      {children ? <div className="mt-2.5">{children}</div> : null}
    </motion.div>
  );
}

/** Écran de fin de session : anneau de score et compteurs animés. */
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
    if (score >= 0.8) void celebrate('big');
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="mx-auto max-w-[480px] pt-8 text-center sm:pt-14"
    >
      <div className="flex justify-center">
        <ProgressRing value={score} size={150} stroke={12}>
          <div>
            <p className="font-display text-[40px] font-bold leading-none tabular-nums">
              <AnimatedNumber value={Math.round(score * 100)} suffix=" %" />
            </p>
            <p className="mt-1 text-[13px] text-muted">de réussite</p>
          </div>
        </ProgressRing>
      </div>
      <h1 className="type-h1 mt-6">{title}</h1>
      {subtitle ? <p className="mt-2 text-[15px] text-muted">{subtitle}</p> : null}

      <div className="mt-7 grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 + index * 0.08 }}
            className="rounded-2xl bg-surface py-4"
          >
            <p className="font-display text-[28px] font-bold tabular-nums" style={{ color: stat.color ?? tokens.text }}>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-[13px] text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {onRestart ? (
          <Button onClick={onRestart}><RotateCcw />{restartLabel}</Button>
        ) : null}
        <Button variant="ghost" onClick={() => navigate('/')}>Retour à l’accueil</Button>
      </div>
    </motion.div>
  );
}

/** Pastille d'icône carrée, couleur unie, façon Réglages iOS. */
export function IconTile({ icon, gradient = gradients.primary, size = 30, radius }: { icon: ReactNode; gradient?: string; size?: number; radius?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center text-white [&_svg]:size-[var(--icon-size)]"
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.24),
        background: gradient,
        '--icon-size': `${Math.round(size * 0.58)}px`,
      } as React.CSSProperties}
    >
      {icon}
    </span>
  );
}
