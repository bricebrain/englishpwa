import { RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { learningApi } from '@/api/learningApi';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PreparedContentCard } from '@/components/content/PreparedContentCard';
import { PageLayout } from '@/components/layout/PageLayout';
import { Alert } from '@/components/ui/alert';
import { Button, IconButton } from '@/components/ui/button';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { Sheet } from '@/components/ui/sheet';
import { isEnglishContent } from '@/helpers/preparedContent';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePreparedContent } from '@/hooks/useLearningQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePreferences } from '@/hooks/usePreferences';
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
          <IconButton aria-label="Actualiser" onClick={() => query.refetch()} className="border border-border bg-ink/5 text-fg">
            <RefreshCw className={query.isFetching ? 'animate-spin' : undefined} />
          </IconButton>
        )}
      />
      <QueryState loading={query.isLoading} error={query.isError} offline={!online} empty={!items.length} onRetry={() => query.refetch()} />
      {deleteMutation.isError ? <Alert severity="error" className="mb-4">La suppression n’a pas pu être enregistrée.</Alert> : null}

      {englishItems.length ? (
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="type-h2">Scripts anglais</h2>
          <span className="font-extrabold text-violet-soft">{englishItems.length}</span>
        </div>
      ) : null}
      <Stagger gap={0.05} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {englishItems.map((item) => (
          <StaggerItem key={item.id} className="h-full">
            <PreparedContentCard item={item} player={playerProps} onDelete={setDeleteTarget} />
          </StaggerItem>
        ))}
      </Stagger>

      {otherItems.length ? (
        <section className="mt-6 flex flex-col gap-2.5">
          <h2 className="type-h2">Langue à vérifier · {otherItems.length}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {otherItems.map((item) => (
              <PreparedContentCard key={item.id} item={item} player={playerProps} onDelete={setDeleteTarget} />
            ))}
          </div>
        </section>
      ) : null}

      <Sheet
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setDeleteTarget(null); }}
        title="Supprimer ce contenu ?"
        description={<>« {deleteTarget?.title} » et son audio seront supprimés du Worker. Cette action est définitive.</>}
      >
        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            className="bg-red bg-none text-bg shadow-none"
            disabled={!deleteTarget || deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
          </Button>
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Annuler</Button>
        </div>
      </Sheet>
    </PageLayout>
  );
}
