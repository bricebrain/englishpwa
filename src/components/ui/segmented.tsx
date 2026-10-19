import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Contrôle segmenté d'iOS : la pastille glisse d'une option à l'autre. */
export function Segmented<T extends string | number>({ value, options, onChange, size = 'md', fullWidth = false, className, ...aria }: {
  value: T | null;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
  'aria-label': string;
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={aria['aria-label']}
      className={cn('inline-flex max-w-full gap-0.5 rounded-[9px] bg-ink/12 p-0.5', fullWidth && 'flex w-full', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            onClick={() => {
              if (selected) return;
              feedback('select');
              onChange(option.value);
            }}
            className={cn(
              'relative inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] font-semibold text-fg transition-opacity disabled:opacity-40 [&_svg]:shrink-0',
              size === 'sm' ? 'h-7 px-3 text-[13px] [&_svg]:size-4' : 'h-8 px-3.5 text-[13px] [&_svg]:size-4',
              !selected && 'hover:opacity-70',
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`segmented-${id}`}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-[7px] bg-segment-on shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)]"
              />
            ) : null}
            <span className="relative inline-flex items-center gap-1.5">{option.icon}{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
