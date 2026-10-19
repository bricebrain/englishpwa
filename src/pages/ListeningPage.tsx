import { Check, ChevronRight, Headphones } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Pressable } from '@/components/ui/motion';
import { Segmented } from '@/components/ui/segmented';
import { IconTile } from '@/components/ui/SessionChrome';
import { useAssimilLessons, useAssimilProgress, usePreparedContent } from '@/hooks/useLearningQueries';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { cn } from '@/lib/utils';
import { gradients, tokens } from '@/theme';
import type { AssimilLevel } from '@/types/learning';

const LEVELS: AssimilLevel[] = ['all', 'A1', 'A2', 'B1', 'B2'];

export function ListeningPage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<AssimilLevel>('B1');
  const lessonsQuery = useAssimilLessons(level);
  const progressQuery = useAssimilProgress();
  const contentQuery = usePreparedContent();
  const player = useAudioPlayer();
  const progressByIndex = useMemo(
    () => Object.fromEntries((progressQuery.data ?? []).map((item) => [item.index, item])),
    [progressQuery.data],
  );
  const featured = contentQuery.data?.filter((item) => item.audioUrl).slice(0, 5) ?? [];

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
      <PageHeader back eyebrow="Compréhension orale" title="Écouter" subtitle="Contenus préparés, Assimil et compréhension guidée" />

      <h2 className="type-h2 mb-3">À écouter maintenant</h2>
      <QueryState loading={contentQuery.isLoading} error={contentQuery.isError} onRetry={() => contentQuery.refetch()} skeletons={1} />
      {featured.length ? (
        <div className="-mx-4 mb-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
          {featured.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.06 }}
              className="w-[86%] shrink-0 snap-start sm:w-[380px]"
            >
              <Card className="h-full overflow-hidden">
                <div className="absolute -right-10 -top-[60px] size-40 rounded-full bg-grad-ocean opacity-20 blur-[20px]" />
                <CardContent className="relative">
                  <div className="flex items-start gap-3">
                    <IconTile icon={<Headphones />} gradient={gradients.ocean} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-bold leading-tight">{item.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted">{item.source} · {item.durationLabel}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <AudioPlayerBar track={{ id: item.id, title: item.title, url: item.audioUrl! }} {...playerProps} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : null}

      <div className="mb-4 flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
        <div>
          <h2 className="type-h2">Parcours Assimil</h2>
          <p className="text-[13.5px] text-muted">Écoute, transcription, notes et exercices.</p>
        </div>
        <Segmented
          aria-label="Niveau Assimil"
          size="sm"
          value={level}
          onChange={setLevel}
          options={LEVELS.map((item) => ({ value: item, label: item === 'all' ? 'Tous' : item }))}
        />
      </div>

      <QueryState loading={lessonsQuery.isLoading} error={lessonsQuery.isError} empty={!lessonsQuery.data?.length} onRetry={() => lessonsQuery.refetch()} />
      <div className="relative">
        <div className="absolute bottom-[30px] left-[27px] top-[30px] w-[3px] rounded-full bg-ink/6" />
        <div className="flex flex-col gap-3">
          {lessonsQuery.data?.map((lesson, index) => {
            const progress = progressByIndex[lesson.index];
            const listened = Boolean(progress?.listened);
            const track = { id: lesson.id, title: lesson.title, url: lesson.audioUrl };
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: Math.min(index, 8) * 0.05 }}
                className="flex items-start gap-3"
              >
                <span
                  className={cn(
                    'relative z-[1] mt-3 grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold',
                    listened ? 'bg-grad-mint text-[#06140E]' : 'border-2 border-border-strong bg-surface text-fg',
                  )}
                  style={listened ? { boxShadow: `0 8px 20px -8px ${tokens.mint}` } : undefined}
                >
                  {listened ? <Check className="size-6" /> : lesson.index}
                </span>
                <Card className="min-w-0 flex-1">
                  <CardContent>
                    <Pressable onClick={() => navigate(`/assimil/lesson/${lesson.index}`)} aria-label={`Ouvrir la leçon ${lesson.index}`}>
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 flex-1">
                          <span className="mb-0.5 flex items-center gap-1.5">
                            <Chip size="sm" label={lesson.level} className="bg-grad-primary text-white" />
                            {lesson.artifactAvailable ? <Chip size="sm" label="Fiche prête" className="bg-mint/14 text-mint" /> : null}
                          </span>
                          <span className="block font-bold leading-tight">{lesson.title}</span>
                          <span className="block text-[12.5px] text-muted">{lesson.stageLabel}</span>
                        </span>
                        <ChevronRight className="size-6 text-violet-soft" />
                      </span>
                    </Pressable>
                    {lesson.audioUrl ? (
                      <div className="mt-3"><AudioPlayerBar track={track} {...playerProps} /></div>
                    ) : (
                      <p className="mt-2 text-[12.5px] text-faint">L’audio original est fourni par le Worker connecté.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
