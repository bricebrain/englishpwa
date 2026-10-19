import { Check } from 'lucide-react';
import { Checkbox as CheckboxPrimitive, Slider as SliderPrimitive, Switch as SwitchPrimitive } from 'radix-ui';
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const fieldClass = [
  'w-full rounded-[18px] border-[1.5px] border-border bg-ink/[0.035] px-4 text-fg placeholder:text-faint',
  'transition-[box-shadow,background-color,border-color] duration-200 outline-none',
  'hover:border-border-strong focus:border-violet focus:bg-violet/7 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--violet)_18%,transparent)]',
  'disabled:opacity-60',
].join(' ');

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClass, 'min-h-14 py-3', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClass, 'block resize-y py-3.5 leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-ink/25 p-0.5 transition-colors',
        'data-[state=checked]:bg-grad-primary disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-6 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.25)] transition-transform duration-200 data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export function Checkbox({ className, ...props }: CheckboxPrimitive.CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'grid size-[22px] shrink-0 place-items-center rounded-md border-2 border-border-strong text-white transition-colors',
        'data-[state=checked]:border-transparent data-[state=checked]:bg-grad-primary disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator><Check className="size-4" strokeWidth={3} /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export function Slider({ className, disabled, ...props }: SliderPrimitive.SliderProps) {
  return (
    <SliderPrimitive.Root
      disabled={disabled}
      className={cn('relative flex h-7 w-full touch-none select-none items-center data-[disabled]:opacity-60', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-ink/12">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-grad-primary" />
      </SliderPrimitive.Track>
      {disabled ? null : (
        <SliderPrimitive.Thumb
          aria-label={props['aria-label']}
          className="block size-4 rounded-full bg-violet shadow-[0_0_0_6px_color-mix(in_srgb,var(--violet)_20%,transparent)] transition-shadow focus-visible:shadow-[0_0_0_8px_color-mix(in_srgb,var(--violet)_30%,transparent)] focus-visible:outline-none"
        />
      )}
    </SliderPrimitive.Root>
  );
}
