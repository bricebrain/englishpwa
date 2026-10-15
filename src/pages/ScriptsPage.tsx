import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Alert,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { learningApi } from '@/api/learningApi';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PreparedContentCard } from '@/components/content/PreparedContentCard';
import { PageLayout } from '@/components/layout/PageLayout';
import { isEnglishContent } from '@/helpers/preparedContent';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePreparedContent } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePreferences } from '@/hooks/usePreferences';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { tokens } from '@/theme';
import type { PreparedContent } from '@/types/learning';

export function ScriptsPage() {
  const online = useNetworkStatus();
  const query = usePreparedContent();
  const player = useAudioPlayer();
  const queryClient = useQueryClient();
  const { preferences } = usePreferences();
  const [deleteTarget, setDeleteTarget] = useState<PreparedContent | null>(null);
  const items = useMemo(() => query.data ?? [], [query.data]);
  const englishItems = useMemo(() => items.filter(isEnglishContent), [items]);
  const otherItems = useMemo(() => items.filter((item) => !isEnglishContent(item)), [items]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => learningApi.deletePreparedContent(id),
    onSuccess: () => {
      player.stop();
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['prepared-content', preferences.profile.id] });
    },
  });

  const playerProps = {
    activeTrack: player.track,
    playing: player.playing,
    currentTime: player.currentTime,
    duration: player.duration,
    speed: player.speed,
    error: player.error,
    onToggle: player.toggle,
    onSeek: player.seek,
    onSpeedChange: player.setSpeed,
    onStop: player.stop,
  };

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Bibliothèque"
        title="Scripts & audios"
        subtitle="Audios, scripts anglais et traductions préparés pour toi"
        action={(
          <IconButton aria-label="Actualiser" onClick={() => query.refetch()} sx={{ background: 'rgba(49,39,78,0.05)', border: `1px solid ${tokens.border}` }}>
            <RefreshRounded />
          </IconButton>
        )}
      />
      <QueryState loading={query.isLoading} error={query.isError} offline={!online} empty={!items.length} onRetry={() => query.refetch()} />
      {deleteMutation.isError ? <Alert severity="error" sx={{ mb: 2 }}>La suppression n’a pas pu être enregistrée.</Alert> : null}

      {englishItems.length ? (
        <Stack direction="row" alignItems="baseline" gap={1} mb={1.5}>
          <Typography variant="h2">Scripts anglais</Typography>
          <Typography fontWeight={800} color={tokens.violetSoft}>{englishItems.length}</Typography>
        </Stack>
      ) : null}
      <Stagger gap={0.05}>
        <Grid container spacing={1.5}>
          {englishItems.map((item) => (
            <Grid item xs={12} sm={6} key={item.id}>
              <StaggerItem sx={{ height: '100%' }}>
                <PreparedContentCard item={item} player={playerProps} onDelete={setDeleteTarget} />
              </StaggerItem>
            </Grid>
          ))}
        </Grid>
      </Stagger>

      {otherItems.length ? (
        <Stack mt={3} gap={1.25}>
          <Typography variant="h2">Langue à vérifier · {otherItems.length}</Typography>
          <Grid container spacing={1.5}>
            {otherItems.map((item) => (
              <Grid item xs={12} sm={6} key={item.id}>
                <PreparedContentCard item={item} player={playerProps} onDelete={setDeleteTarget} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      ) : null}

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}>
        <DialogTitle>Supprimer ce contenu ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            « {deleteTarget?.title} » et son audio seront supprimés du Worker. Cette action est définitive.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Annuler</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deleteTarget || deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}
