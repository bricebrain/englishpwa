import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useRef, type CSSProperties, type PropsWithChildren } from 'react';

import { softSpring, spring } from '@/components/ui/springs';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';

interface PressableProps {
  className?: string;
  style?: CSSProperties;
  silent?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-current'?: 'page' | undefined;
}

/** Bouton « tactile » : léger rebond à l'appui + micro-vibration. */
export function Pressable({ className, style, silent = false, onClick, children, disabled, ...aria }: PressableProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={spring}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        if (!silent) feedback('tap');
        onClick?.(event);
      }}
      className={cn('block w-full text-left text-inherit disabled:cursor-default disabled:opacity-50', className)}
      style={style}
      {...aria}
    >
      {children}
    </motion.button>
  );
}

/** Conteneur dont les enfants <StaggerItem> apparaissent en cascade. */
export function Stagger({ children, delay = 0, gap = 0.06, className }: PropsWithChildren<{ delay?: number; gap?: number; className?: string }>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: softSpring },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Nombre qui « compte » jusqu'à sa valeur lorsqu'il devient visible. */
export function AnimatedNumber({ value, duration = 1.1, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => `${Math.round(latest).toLocaleString('fr-FR')}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [duration, inView, motionValue, reduce, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
