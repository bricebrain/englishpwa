import LibraryAddRounded from '@mui/icons-material/LibraryAddRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  IconButton,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';

import { learningApi } from '@/api/learningApi';
import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { AssimilExerciseCard } from '@/components/listening/AssimilExerciseCard';
import { AssimilDialoguePanel } from '@/components/listening/AssimilDialoguePanel';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { speakEnglish } from '@/services/speechPlaybackService';
import { gradients, tokens } from '@/theme';

export function AssimilLessonPage() {
  const index = Number(useParams<{ index: string }>().index);
  const query = useQuery({
    queryKey: ['assimil-prepared-lesson', index],
    queryFn: () => learningApi.getAssimilPreparedLesson(index),
    enabled: Number.isFinite(index),
    retry: 1,
  });
  const player = useAudioPlayer();
  const lesson = query.data;
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
      <PageHeader back eyebrow={lesson ? `Leçon ${lesson.index} · ${lesson.level}` : 'Assimil'} title={lesson ? lesson.title : 'Leçon Assimil'} subtitle="Écoute active, transcription et exercices" />
      <QueryState loading={query.isLoading} error={query.isError || !Number.isFinite(index)} onRetry={() => query.refetch()} />
      {lesson ? (
        <Stack gap={2}>
          <Card sx={{ overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(90% 120% at 0% 0%, rgba(70,217,245,0.16), transparent 60%)', pointerEvents: 'none' }} />
            <CardContent sx={{ position: 'relative' }}>
              <Stack direction="row" gap={1} mb={1.5}>
                <Chip label={lesson.level} sx={{ background: gradients.primary, color: '#fff' }} />
                <Chip label={lesson.stageLabel} />
              </Stack>
              {lesson.audioUrl ? (
                <AudioPlayerBar track={{ id: lesson.id, title: lesson.title, url: lesson.audioUrl }} {...playerProps} />
              ) : (
                <Alert severity="info">L’audio original de cette leçon nécessite le Worker connecté.</Alert>
              )}
            </CardContent>
          </Card>

          {lesson.artifact ? (
            <>
              <Card><CardContent>
                <Typography variant="overline" color={tokens.violetSoft}>Résumé</Typography>
                <Typography variant="h2">{lesson.artifact.titleEn}</Typography>
                <Typography color="text.secondary" mt={0.5}>{lesson.artifact.titleFr}</Typography>
                <Typography mt={1.5} lineHeight={1.7}>{lesson.artifact.summaryFr}</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mt={2}>
                  {lesson.artifact.objectives.map((objective) => <Chip key={objective} label={objective} sx={{ background: 'rgba(255,93,162,0.12)', color: tokens.pink, height: 'auto', py: 0.5, '& .MuiChip-label': { whiteSpace: 'normal' } }} />)}
                </Stack>
              </CardContent></Card>

              <Box>
                <Typography variant="h2" mb={1.25}>Phrases clés</Typography>
                <Grid container spacing={1.5}>
                  {lesson.artifact.sentences.map((sentence) => (
                    <Grid item xs={12} md={6} key={sentence.id}>
                      <Card sx={{ height: '100%' }}><CardContent>
                        <Stack direction="row" justifyContent="space-between" gap={1}>
                          <Typography fontWeight={800} fontSize={17} lineHeight={1.4}>{sentence.textEn}</Typography>
                          <IconButton aria-label="Écouter" onClick={() => speakEnglish(sentence.textEn)} sx={{ flexShrink: 0, background: gradients.ocean, color: '#fff', width: 40, height: 40, minWidth: 40, minHeight: 40 }}><VolumeUpRounded fontSize="small" /></IconButton>
                        </Stack>
                        <Typography color="text.secondary" mt={0.5}>{sentence.textFr}</Typography>
                        <Alert severity="info" icon={false} sx={{ mt: 1.5 }}>{sentence.focus} · {sentence.pronunciationTipFr}</Alert>
                      </CardContent></Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {lesson.audioUrl && lesson.audioAnalysis?.dialogue?.length ? (
                <AssimilDialoguePanel
                  audioUrl={lesson.audioUrl}
                  lessonId={lesson.id}
                  dialogue={lesson.audioAnalysis.dialogue}
                  player={playerProps}
                />
              ) : null}

              {lesson.artifact.notes?.length ? (
                <Box>
                  <Typography variant="h2" mb={1.25}>Notes pédagogiques</Typography>
                  <Grid container spacing={1.5}>
                    {lesson.artifact.notes.map((note) => (
                      <Grid item xs={12} md={6} key={note.id}>
                        <Card sx={{ height: '100%' }}><CardContent>
                          <Typography variant="h3">{note.topic}</Typography>
                          <Typography lineHeight={1.7} mt={1}>{note.explanationFr}</Typography>
                          <Stack gap={0.75} mt={1.25}>{note.examples.map((example) => <Alert key={example.en} severity="info" icon={false}>{example.en}<br />{example.fr}</Alert>)}</Stack>
                        </CardContent></Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : null}

              <Box>
                <Typography variant="h2" mb={1.25}>Exercices</Typography>
                <Stack gap={1.5}>{lesson.artifact.exercises.map((exercise) => <AssimilExerciseCard key={exercise.id} exercise={exercise} />)}</Stack>
              </Box>

              <Card><CardContent>
                <Stack direction="row" gap={1} alignItems="center"><LibraryAddRounded sx={{ color: tokens.mint }} /><Typography variant="h3">À recycler dans le SRS</Typography></Stack>
                <Stack gap={1} mt={1.5}>{lesson.artifact.recyclingTargets.map((target) => <Box key={target.term} sx={{ pl: 1.5, borderLeft: `3px solid ${tokens.mint}` }}><Typography fontWeight={800}>{target.term}</Typography><Typography color="text.secondary" fontSize={13}>{target.reasonFr}</Typography></Box>)}</Stack>
              </CardContent></Card>
            </>
          ) : (
            <Card><CardContent>
              <Typography variant="h2">Transcription</Typography>
              <Typography whiteSpace="pre-wrap" lineHeight={1.8} mt={1.5}>{lesson.transcript ?? 'La fiche guidée n’est pas encore préparée.'}</Typography>
            </CardContent></Card>
          )}
        </Stack>
      ) : null}
    </PageLayout>
  );
}
