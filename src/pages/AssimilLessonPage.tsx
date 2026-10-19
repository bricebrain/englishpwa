import { ListPlus, Volume2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { learningApi } from '@/api/learningApi';
import { AudioPlayerBar } from '@/components/audio/AudioPlayerBar';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/common/QueryState';
import { AssimilExerciseCard } from '@/components/listening/AssimilExerciseCard';
import { AssimilDialoguePanel } from '@/components/listening/AssimilDialoguePanel';
import { PageLayout } from '@/components/layout/PageLayout';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Pressable } from '@/components/ui/motion';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { speakEnglish } from '@/services/speechPlaybackService';

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
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_0%_0%,color-mix(in_srgb,var(--cyan)_16%,transparent),transparent_60%)]" />
            <CardContent className="relative">
              <div className="mb-3 flex gap-2">
                <Chip label={lesson.level} className="bg-grad-primary text-white" />
                <Chip label={lesson.stageLabel} />
              </div>
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
                <span className="type-overline text-violet-soft">Résumé</span>
                <h2 className="type-h2">{lesson.artifact.titleEn}</h2>
                <p className="mt-1 text-muted">{lesson.artifact.titleFr}</p>
                <p className="mt-3 leading-[1.7]">{lesson.artifact.summaryFr}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lesson.artifact.objectives.map((objective) => (
                    <span key={objective} className="rounded-[10px] bg-pink/12 px-2.5 py-1 text-[13px] font-bold text-pink">{objective}</span>
                  ))}
                </div>
              </CardContent></Card>

              <section>
                <h2 className="type-h2 mb-2.5">Phrases clés</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {lesson.artifact.sentences.map((sentence) => (
                    <Card key={sentence.id} className="h-full"><CardContent>
                      <div className="flex justify-between gap-2">
                        <p className="text-[17px] font-bold leading-[1.4]">{sentence.textEn}</p>
                        <Pressable onClick={() => speakEnglish(sentence.textEn)} aria-label="Écouter" className="size-10 w-10 shrink-0 rounded-full">
                          <span className="grid size-10 place-items-center rounded-full bg-grad-ocean text-white"><Volume2 className="size-5" /></span>
                        </Pressable>
                      </div>
                      <p className="mt-1 text-muted">{sentence.textFr}</p>
                      <Alert severity="info" icon={false} className="mt-3">{sentence.focus} · {sentence.pronunciationTipFr}</Alert>
                    </CardContent></Card>
                  ))}
                </div>
              </section>

              {lesson.audioUrl && lesson.audioAnalysis?.dialogue?.length ? (
                <AssimilDialoguePanel
                  audioUrl={lesson.audioUrl}
                  lessonId={lesson.id}
                  dialogue={lesson.audioAnalysis.dialogue}
                  player={playerProps}
                />
              ) : null}

              {lesson.artifact.notes?.length ? (
                <section>
                  <h2 className="type-h2 mb-2.5">Notes pédagogiques</h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {lesson.artifact.notes.map((note) => (
                      <Card key={note.id} className="h-full"><CardContent>
                        <h3 className="type-h3">{note.topic}</h3>
                        <p className="mt-2 leading-[1.7]">{note.explanationFr}</p>
                        <div className="mt-2.5 flex flex-col gap-1.5">
                          {note.examples.map((example) => <Alert key={example.en} severity="info" icon={false}>{example.en}<br />{example.fr}</Alert>)}
                        </div>
                      </CardContent></Card>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <h2 className="type-h2 mb-2.5">Exercices</h2>
                <div className="flex flex-col gap-3">{lesson.artifact.exercises.map((exercise) => <AssimilExerciseCard key={exercise.id} exercise={exercise} />)}</div>
              </section>

              <Card><CardContent>
                <div className="flex items-center gap-2"><ListPlus className="size-6 text-mint" /><h3 className="type-h3">À recycler dans le SRS</h3></div>
                <div className="mt-3 flex flex-col gap-2">
                  {lesson.artifact.recyclingTargets.map((target) => (
                    <div key={target.term} className="border-l-[3px] border-mint pl-3">
                      <p className="font-bold">{target.term}</p>
                      <p className="text-[13px] text-muted">{target.reasonFr}</p>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </>
          ) : (
            <Card><CardContent>
              <h2 className="type-h2">Transcription</h2>
              <p className="mt-3 whitespace-pre-wrap leading-[1.8]">{lesson.transcript ?? 'La fiche guidée n’est pas encore préparée.'}</p>
            </CardContent></Card>
          )}
        </div>
      ) : null}
    </PageLayout>
  );
}
