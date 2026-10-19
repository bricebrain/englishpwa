import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';

import { spring } from '@/components/ui/springs';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Choix exclusif façon « pilule » : l'indicateur glisse d'une option à l'autre. */
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
      className={cn('inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-ink/[0.035] p-1', fullWidth && 'flex w-full', className)}
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
              'relative inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-colors disabled:opacity-40 [&_svg]:shrink-0',
              size === 'sm' ? 'min-h-[34px] px-3 text-[13px] [&_svg]:size-4' : 'min-h-[38px] px-3.5 text-sm [&_svg]:size-[18px]',
              fullWidth && 'flex-1',
              selected ? 'text-white' : 'text-muted hover:text-fg',
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`segmented-${id}`}
                transition={spring}
                className="absolute inset-0 rounded-xl bg-grad-primary shadow-[0_6px_18px_-8px_color-mix(in_srgb,var(--violet)_90%,transparent)]"
              />
            ) : null}
            <span className="relative inline-flex items-center gap-1.5">{option.icon}{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
