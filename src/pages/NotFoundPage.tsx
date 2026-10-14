import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { PageLayout } from '@/components/layout/PageLayout';
import { MotionBox } from '@/components/ui/motion';
import { displayFont } from '@/theme';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <PageLayout reading>
      <MotionBox initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} sx={{ textAlign: 'center', pt: 10 }}>
        <MotionBox animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }} sx={{ display: 'inline-block' }}>
          <Typography fontFamily={displayFont} fontWeight={800} fontSize={96} lineHeight={1} className="text-gradient">404</Typography>
        </MotionBox>
        <Typography variant="h2" mt={2}>Lost in translation</Typography>
        <Typography color="text.secondary" mt={1} mb={4}>Cette page n’existe pas ou n’est plus disponible.</Typography>
        <Button size="large" variant="contained" onClick={() => navigate('/')}>Revenir à l’accueil</Button>
      </MotionBox>
    </PageLayout>
  );
}
