import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['type-h1', 'type-h2', 'type-h3', 'type-overline'],
      'bg-image': ['bg-grad-primary', 'bg-grad-sunrise', 'bg-grad-ocean', 'bg-grad-mint'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
