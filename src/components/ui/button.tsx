import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold',
    'transition-[transform,opacity,background-color,color] duration-200 ease-out active:scale-[0.97] active:opacity-80',
    'disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        /** Bouton plein, couleur d'accent. */
        primary: 'bg-grad-primary text-white shadow-[0_12px_26px_-12px_rgb(91_79_245/0.75)]',
        /** Bouton plein vert, pour valider une réussite. */
        success: 'bg-grad-mint text-white shadow-[0_12px_26px_-12px_rgb(32_178_107/0.7)]',
        /** Bouton plein secondaire (même rendu que primary, conservé pour compatibilité). */
        secondary: 'bg-grad-primary text-white shadow-[0_12px_26px_-12px_rgb(91_79_245/0.75)]',
        /** Bouton « gris » d'iOS. */
        outline: 'bg-ink/[0.08] text-fg hover:bg-ink/12',
        /** Bouton texte, couleur d'accent. */
        ghost: 'text-violet hover:bg-violet/8',
      },
      size: {
        sm: 'min-h-9 rounded-[10px] px-3.5 text-[15px] [&_svg]:size-[17px]',
        md: 'min-h-[52px] rounded-2xl px-5 text-[17px] [&_svg]:size-5',
        lg: 'min-h-[56px] rounded-2xl px-6 text-[18px] [&_svg]:size-5',
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
    'inline-grid shrink-0 place-items-center rounded-full bg-ink/[0.08] text-muted transition-[transform,background-color,color] duration-200',
    'hover:bg-ink/12 active:scale-90 disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      size: {
        sm: 'size-8 [&_svg]:size-4',
        md: 'size-9 [&_svg]:size-[18px]',
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
    <button ref={ref} type={type} className={cn(iconButtonVariants({ size }), 'before:absolute before:-inset-1 relative', className)} {...props} />
  ),
);
IconButton.displayName = 'IconButton';
