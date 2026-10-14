import { Box, Container } from '@mui/material';
import type { PropsWithChildren } from 'react';

import { APP_LAYOUT } from '@/constants/layout';

interface PageLayoutProps extends PropsWithChildren {
  reading?: boolean;
}

export function PageLayout({ children, reading = false }: PageLayoutProps) {
  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: reading ? APP_LAYOUT.readingMaxWidth : APP_LAYOUT.dashboardMaxWidth,
        px: { xs: 2, sm: 3, md: 4 },
        pt: 'max(16px, calc(env(safe-area-inset-top) + 8px))',
        pb: { xs: 4, sm: 6 },
      }}
    >
      <Box>{children}</Box>
    </Container>
  );
}
