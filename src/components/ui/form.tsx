import { Check } from 'lucide-react';
import { Checkbox as CheckboxPrimitive, Slider as SliderPrimitive, Switch as SwitchPrimitive } from 'radix-ui';
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const fieldClass = [
  'w-full rounded-xl bg-surface px-4 text-fg placeholder:text-faint outline-none',
  'shadow-[inset_0_0_0_1px_var(--border)] transition-shadow duration-200',
  'focus:shadow-[inset_0_0_0_2px_var(--violet)] disabled:opacity-60',
].join(' ');

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClass, 'h-[52px]', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClass, 'block resize-y py-3 leading-snug', className)} {...props} />
));
Textarea.displayName = 'Textarea';

/** Interrupteur d'iOS : piste verte, pastille qui glisse avec un léger rebond. */
export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full bg-ink/16 p-0.5 transition-colors duration-300',
        'data-[state=checked]:bg-switch-on disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export function Checkbox({ className, ...props }: CheckboxPrimitive.CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px] border-ink/30 text-white transition-colors duration-200',
        'data-[state=checked]:border-transparent data-[state=checked]:bg-grad-primary disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator><Check className="size-3.5" strokeWidth={3.2} /></CheckboxPrimitive.Indicator>
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
      <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-ink/16">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-violet" />
      </SliderPrimitive.Track>
      {disabled ? null : (
        <SliderPrimitive.Thumb
          aria-label={props['aria-label']}
          className="block size-7 rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform active:scale-110 focus-visible:outline-none"
        />
      )}
    </SliderPrimitive.Root>
  );
}
