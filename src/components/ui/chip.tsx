import { cva, type VariantProps } from 'class-variance-authority';
import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';

const chipVariants = cva('inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap font-bold [&_svg]:shrink-0', {
  variants: {
    variant: {
      filled: 'bg-ink/7 text-fg',
      outlined: 'border border-border-strong text-fg',
    },
    size: {
      sm: 'h-6 rounded-lg px-2 text-[11.5px] [&_svg]:size-3.5',
      md: 'h-7 rounded-[10px] px-2.5 text-[13px] [&_svg]:size-4',
    },
  },
  defaultVariants: { variant: 'filled', size: 'md' },
});

interface ChipProps extends VariantProps<typeof chipVariants> {
  label: ReactNode;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Chip({ label, icon, variant, size, className, style }: ChipProps) {
  return (
    <span className={cn(chipVariants({ variant, size }), className)} style={style}>
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}
