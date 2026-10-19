import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';

import { alpha, tokens } from '@/theme';

interface ProgressRingProps {
  value: number; // 0 → 1
  size?: number;
  stroke?: number;
  colors?: [string, string];
  track?: string;
  children?: ReactNode;
  glow?: boolean;
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 12,
  colors = [tokens.violet, tokens.pink],
  track = alpha(tokens.ink, 0.08),
  children,
  glow = true,
}: ProgressRingProps) {
  const id = useId().replace(/:/g, '');
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: colors[0] }} />
            <stop offset="100%" style={{ stopColor: colors[1] }} />
          </linearGradient>
          {glow ? (
            <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ) : null}
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" style={{ stroke: track }} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={glow ? `url(#glow-${id})` : undefined}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
