import { Box, styled, type BoxProps } from '@mui/material';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef, type PropsWithChildren } from 'react';

import { softSpring, spring } from '@/components/ui/springs';
import { feedback } from '@/services/feedbackService';

export const MotionBox = motion.create(Box);

const BareButton = styled('button')({
  appearance: 'none',
  border: 0,
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'inherit',
  background: 'none',
  cursor: 'pointer',
  display: 'block',
  width: '100%',
  WebkitTapHighlightColor: 'transparent',
  '&:disabled': { cursor: 'default', opacity: 0.5 },
});

const MotionButton = motion.create(BareButton);


interface PressableProps {
  sx?: BoxProps['sx'];
  silent?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-current'?: 'page' | undefined;
}

/** Bouton « tactile » : léger rebond à l'appui + micro-vibration. */
export function Pressable({ sx, silent = false, onClick, children, disabled, ...aria }: PressableProps) {
  return (
    <MotionButton
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={spring}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        if (!silent) feedback('tap');
        onClick?.(event);
      }}
      sx={sx}
      {...aria}
    >
      {children}
    </MotionButton>
  );
}

/** Conteneur dont les enfants <StaggerItem> apparaissent en cascade. */
export function Stagger({ children, delay = 0, gap = 0.06, sx }: PropsWithChildren<{ delay?: number; gap?: number; sx?: BoxProps['sx'] }>) {
  return (
    <MotionBox
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      sx={sx}
    >
      {children}
    </MotionBox>
  );
}

export function StaggerItem({ children, sx }: PropsWithChildren<{ sx?: BoxProps['sx'] }>) {
  return (
    <MotionBox
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: softSpring },
      }}
      sx={sx}
    >
      {children}
    </MotionBox>
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
