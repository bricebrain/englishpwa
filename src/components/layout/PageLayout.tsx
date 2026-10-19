import type { PropsWithChildren } from 'react';

import { APP_LAYOUT } from '@/constants/layout';

interface PageLayoutProps extends PropsWithChildren {
  reading?: boolean;
}

export function PageLayout({ children, reading = false }: PageLayoutProps) {
  return (
    <div
      className="mx-auto w-full px-4 pb-8 pt-[max(12px,env(safe-area-inset-top))] sm:px-6 sm:pb-12 md:px-8"
      style={{ maxWidth: reading ? APP_LAYOUT.readingMaxWidth : APP_LAYOUT.dashboardMaxWidth }}
    >
      {children}
    </div>
  );
}
