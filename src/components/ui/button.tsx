import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-bold tracking-[-0.005em]',
    'transition-[transform,box-shadow,filter,background-color,border-color,color] duration-150 active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-grad-primary text-white shadow-[0_10px_28px_-10px_color-mix(in_srgb,var(--violet)_80%,transparent)] hover:brightness-110',
        success: 'bg-grad-mint text-[#05140D] shadow-[0_10px_28px_-12px_color-mix(in_srgb,var(--mint)_80%,transparent)] hover:brightness-105',
        secondary: 'bg-grad-sunrise text-white shadow-[0_10px_28px_-12px_color-mix(in_srgb,var(--coral)_80%,transparent)] hover:brightness-105',
        outline: 'border border-border-strong bg-ink/[0.025] text-fg hover:border-violet-soft hover:bg-violet/8',
        ghost: 'text-violet hover:bg-ink/6',
      },
      size: {
        sm: 'min-h-9 rounded-xl px-3 text-[13px] [&_svg]:size-[18px]',
        md: 'min-h-12 rounded-2xl px-[18px] text-[15px] [&_svg]:size-5',
        lg: 'min-h-[52px] rounded-2xl px-[22px] text-base [&_svg]:size-[22px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
    const Component = asChild ? Slot.Root : 'button';
    return <Component ref={ref} type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = 'Button';

const iconButtonVariants = cva(
  [
    'inline-grid shrink-0 place-items-center rounded-full text-muted transition-[transform,background-color,color] duration-150',
    'hover:bg-ink/6 active:scale-90 disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      size: {
        sm: 'size-9 [&_svg]:size-[18px]',
        md: 'size-11 [&_svg]:size-6',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(iconButtonVariants({ size }), className)} {...props} />
  ),
);
IconButton.displayName = 'IconButton';
