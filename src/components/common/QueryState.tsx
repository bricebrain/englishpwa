import CloudOffRounded from '@mui/icons-material/CloudOffRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import InboxRounded from '@mui/icons-material/InboxRounded';
import { Box, Button, Stack, Typography } from '@mui/material';

import { MotionBox } from '@/components/ui/motion';
import { tokens } from '@/theme';

interface QueryStateProps {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  offline?: boolean;
  onRetry?: () => void;
  emptyLabel?: string;
  skeletons?: number;
}

export function QueryState({ loading, error, empty, offline, onRetry, emptyLabel, skeletons = 3 }: QueryStateProps) {
  if (loading) {
    return (
      <Stack gap={1.5} role="status" aria-label="Chargement" mb={2}>
        {Array.from({ length: skeletons }, (_, index) => (
          <Box key={index} className="shimmer" sx={{ height: index === 0 ? 150 : 88, borderRadius: 6, border: `1px solid ${tokens.border}` }} />
        ))}
      </Stack>
    );
  }

  if (offline || error) {
    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{ textAlign: 'center', py: 5, px: 3, mb: 2, borderRadius: 6, background: 'rgba(255,84,112,0.06)', border: '1px solid rgba(255,84,112,0.2)' }}
      >
        <Box sx={{ width: 56, height: 56, mx: 'auto', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,84,112,0.14)', color: tokens.red }}>
          {offline ? <CloudOffRounded /> : <ErrorOutlineRounded />}
        </Box>
        <Typography fontWeight={800} mt={1.5}>
          {offline ? 'Pas de connexion' : 'Impossible de charger les données'}
        </Typography>
        <Typography color="text.secondary" fontSize={14} mt={0.5}>
          {offline ? 'Reconnecte-toi pour retrouver tes contenus.' : 'Un petit souci côté serveur.'}
        </Typography>
        {onRetry ? <Button variant="outlined" onClick={onRetry} sx={{ mt: 2 }}>Réessayer</Button> : null}
      </MotionBox>
    );
  }

  if (empty) {
    return (
      <Box textAlign="center" py={7} color="text.secondary">
        <InboxRounded sx={{ fontSize: 42, mb: 1, color: tokens.textFaint }} />
        <Typography>{emptyLabel ?? 'Rien à afficher pour l’instant.'}</Typography>
      </Box>
    );
  }

  return null;
}
