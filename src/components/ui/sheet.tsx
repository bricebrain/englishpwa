import type { ReactNode } from 'react';
import { Drawer } from 'vaul';

/** Feuille qui monte du bas de l'écran (glisser vers le bas pour fermer). */
export function Sheet({ open, onOpenChange, title, description, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1200] bg-black/45 backdrop-blur-[6px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[1200] mx-auto flex max-w-lg flex-col rounded-t-[28px] border border-b-0 border-border bg-surface px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 text-fg outline-none">
          <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-ink/20" aria-hidden />
          <Drawer.Title className="type-h2">{title}</Drawer.Title>
          {description ? <Drawer.Description className="mt-2 leading-relaxed text-muted">{description}</Drawer.Description> : null}
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
