import CheckRounded from '@mui/icons-material/CheckRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import HeadphonesRounded from '@mui/icons-material/HeadphonesRounded';
import { Box, Card, CardContent, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { MotionBox, Pressable } from '@/components/ui/motion';
import { IconTile } from '@/components/ui/SessionChrome';
import { useAssimilLessons, useAssimilProgress, usePreparedContent } from '@/hooks/useLearningQueries';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { feedback } from '@/services/feedbackService';
import { displayFont, gradients, tokens } from '@/theme';
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

      <Typography variant="h2" mb={1.5}>À écouter maintenant</Typography>
      <QueryState loading={contentQuery.isLoading} error={contentQuery.isError} onRetry={() => contentQuery.refetch()} skeletons={1} />
      {featured.length ? (
        <Box
          sx={{
            display: 'flex', gap: 1.5, overflowX: 'auto', scrollSnapType: 'x mandatory', mx: { xs: -2, sm: -3 }, px: { xs: 2, sm: 3 }, pb: 1, mb: 3.5,
            scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {featured.map((item, index) => (
            <MotionBox
              key={item.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.06 }}
              sx={{ flex: '0 0 auto', width: { xs: '86%', sm: 380 }, scrollSnapAlign: 'start' }}
            >
              <Card sx={{ height: '100%', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -60, right: -40, width: 160, height: 160, borderRadius: '50%', background: gradients.ocean, opacity: 0.18, filter: 'blur(20px)' }} />
                <CardContent sx={{ position: 'relative' }}>
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <IconTile icon={<HeadphonesRounded />} gradient={gradients.ocean} />
                    <Box flex={1} minWidth={0}>
                      <Typography fontWeight={800} lineHeight={1.3} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Typography>
                      <Typography color="text.secondary" fontSize={12.5} mt={0.25}>{item.source} · {item.durationLabel}</Typography>
                    </Box>
                  </Stack>
                  <Box mt={2}>
                    <AudioPlayerBar track={{ id: item.id, title: item.title, url: item.audioUrl! }} {...playerProps} />
                  </Box>
                </CardContent>
              </Card>
            </MotionBox>
          ))}
        </Box>
      ) : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1.25} mb={2}>
        <Box>
          <Typography variant="h2">Parcours Assimil</Typography>
          <Typography color="text.secondary" fontSize={13.5}>Écoute, transcription, notes et exercices.</Typography>
        </Box>
        <ToggleButtonGroup
          size="small" exclusive value={level}
          onChange={(_, value: AssimilLevel | null) => { if (value) { feedback('select'); setLevel(value); } }}
          aria-label="Niveau Assimil"
        >
          {LEVELS.map((item) => <ToggleButton key={item} value={item}>{item === 'all' ? 'Tous' : item}</ToggleButton>)}
        </ToggleButtonGroup>
      </Stack>

      <QueryState loading={lessonsQuery.isLoading} error={lessonsQuery.isError} empty={!lessonsQuery.data?.length} onRetry={() => lessonsQuery.refetch()} />
      <Box position="relative">
        <Box sx={{ position: 'absolute', left: 27, top: 30, bottom: 30, width: 3, borderRadius: 3, background: 'rgba(49,39,78,0.065)' }} />
        <Stack gap={1.5}>
          {lessonsQuery.data?.map((lesson, index) => {
            const progress = progressByIndex[lesson.index];
            const listened = Boolean(progress?.listened);
            const track = { id: lesson.id, title: lesson.title, url: lesson.audioUrl };
            return (
              <MotionBox
                key={lesson.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: Math.min(index, 8) * 0.05 }}
              >
                <Stack direction="row" gap={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      position: 'relative', zIndex: 1, mt: 1.5, width: 56, height: 56, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
                      background: listened ? gradients.mint : tokens.surfaceRaised, color: listened ? '#06140E' : 'text.primary',
                      border: listened ? 0 : `2px solid ${tokens.borderStrong}`, fontFamily: displayFont, fontWeight: 800, fontSize: 18,
                      boxShadow: listened ? `0 8px 20px -8px ${tokens.mint}` : 'none',
                    }}
                  >
                    {listened ? <CheckRounded /> : lesson.index}
                  </Box>
                  <Card sx={{ flex: 1, minWidth: 0 }}>
                    <CardContent>
                      <Pressable onClick={() => navigate(`/assimil/lesson/${lesson.index}`)} aria-label={`Ouvrir la leçon ${lesson.index}`}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Box flex={1} minWidth={0}>
                            <Stack direction="row" gap={0.75} alignItems="center" mb={0.25}>
                              <Chip label={lesson.level} size="small" sx={{ background: gradients.primary, color: '#fff' }} />
                              {lesson.artifactAvailable ? <Chip label="Fiche prête" size="small" sx={{ background: 'rgba(52,229,160,0.14)', color: tokens.mint }} /> : null}
                            </Stack>
                            <Typography fontWeight={800} lineHeight={1.3}>{lesson.title}</Typography>
                            <Typography color="text.secondary" fontSize={12.5}>{lesson.stageLabel}</Typography>
                          </Box>
                          <ChevronRightRounded sx={{ color: tokens.violetSoft }} />
                        </Stack>
                      </Pressable>
                      {lesson.audioUrl ? (
                        <Box mt={1.5}><AudioPlayerBar track={track} {...playerProps} /></Box>
                      ) : (
                        <Typography color="text.disabled" fontSize={12.5} mt={1}>L’audio original est fourni par le Worker connecté.</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </MotionBox>
            );
          })}
        </Stack>
      </Box>
    </PageLayout>
  );
}
