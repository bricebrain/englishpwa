import BackspaceRounded from '@mui/icons-material/BackspaceRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import KeyboardRounded from '@mui/icons-material/KeyboardRounded';
import ViewModuleRounded from '@mui/icons-material/ViewModuleRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Button, Chip, IconButton, InputBase, Stack, styled, Typography } from '@mui/material';
import { LayoutGroup, motion } from 'framer-motion';
import { useMemo, useRef, useState, type FormEvent } from 'react';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { MotionBox } from '@/components/ui/motion';
import { CelebrationCard, ResultPanel, SessionHeader } from '@/components/ui/SessionChrome';
import { useCombo } from '@/hooks/useCombo';
import { useDailySentences } from '@/hooks/useAiFeatures';
import { evaluateSentence } from '@/helpers/sentenceEvaluation';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { displayFont, gradients, tokens } from '@/theme';
import type { SentenceExercise } from '@/types/aiFeatures';

/** Exercices de secours si les phrases du jour ne sont pas disponibles. */
const FALLBACK_EXERCISES: SentenceExercise[] = [
  { prompt: 'Je travaille ici depuis trois ans.', expected: 'I have worked here for three years', hint: 'Present perfect + for', distractors: ['since', 'work', 'am'] },
  { prompt: 'Si j’avais plus de temps, je lirais davantage.', expected: 'If I had more time, I would read more', hint: 'Second conditional', distractors: ['will', 'have', 'reading'] },
  { prompt: 'Elle avait déjà quitté le bureau.', expected: 'She had already left the office', hint: 'Past perfect', distractors: ['has', 'leaved', 'yet'] },
];

interface Tile { id: string; word: string }

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

export function SentenceBuilderPage() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [placed, setPlaced] = useState<string[]>([]);
  const [keyboard, setKeyboard] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const score = useRef(0);
  const combo = useCombo(15);
  const daily = useDailySentences();
  const exercises = daily.data?.exercises?.length ? daily.data.exercises : FALLBACK_EXERCISES;
  const generated = Boolean(daily.data?.exercises?.length);
  const completed = index >= exercises.length;
  const exercise = exercises[Math.min(index, exercises.length - 1)]!;

  const tiles = useMemo<Tile[]>(
    () => shuffle([...exercise.expected.split(' '), ...exercise.distractors].map((word, tileIndex) => ({ id: `${index}-${tileIndex}`, word }))),
    [exercise, index],
  );
  const byId = useMemo(() => new Map(tiles.map((tile) => [tile.id, tile])), [tiles]);
  const builtSentence = keyboard ? answer : placed.map((id) => byId.get(id)?.word ?? '').join(' ');

  const check = () => {
    if (!builtSentence.trim()) return;
    const ok = evaluateSentence(builtSentence, exercise.expected);
    setCorrect(ok);
    if (ok) { score.current += 1; combo.hit(); } else combo.miss();
  };

  const next = () => {
    feedback('tap');
    setIndex((value) => value + 1);
    setAnswer('');
    setPlaced([]);
    setCorrect(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (correct !== null) next();
    else check();
  };

  const restart = () => {
    score.current = 0;
    combo.reset();
    setIndex(0);
    setPlaced([]);
    setAnswer('');
    setCorrect(null);
  };

  if (daily.isLoading) {
    return (
      <PageLayout reading>
        <QueryState loading skeletons={2} />
      </PageLayout>
    );
  }

  if (completed) {
    return (
      <PageLayout reading>
        <CelebrationCard
          title="Phrases construites !"
          subtitle="Ces structures deviennent des réflexes à force de les assembler."
          score={score.current / exercises.length}
          stats={[
            { label: 'Correctes', value: score.current, color: tokens.mint },
            { label: 'Phrases', value: exercises.length },
          ]}
          onRestart={restart}
          restartLabel="Recommencer"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout reading>
      <SessionHeader
        progress={(index + (correct !== null ? 1 : 0)) / exercises.length}
        combo={combo.combo}
        label={`${index + 1}/${exercises.length}`}
        action={(
          <IconButton
            aria-label={keyboard ? 'Passer en mode tuiles' : 'Passer en mode clavier'}
            onClick={() => { feedback('select'); setKeyboard((value) => !value); }}
            sx={{ color: 'text.secondary' }}
          >
            {keyboard ? <ViewModuleRounded /> : <KeyboardRounded />}
          </IconButton>
        )}
      />

      <MotionBox key={index} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
        <Chip label={exercise.hint} size="small" sx={{ background: gradients.sunrise, color: '#fff', mb: 2 }} />
        {generated && index === 0 ? (
          <Typography fontSize={12.5} fontWeight={700} color={tokens.violetSoft} mb={1}>
            Phrases du jour, écrites pour toi avec tes mots à réviser
          </Typography>
        ) : null}
        <Typography variant="overline" color="text.secondary" display="block">Traduis en anglais</Typography>
        <Typography fontFamily={displayFont} fontSize={{ xs: 26, sm: 30 }} fontWeight={750} lineHeight={1.3} mt={0.5} mb={3}>
          {exercise.prompt}
        </Typography>

        <Box component="form" onSubmit={submit}>
          {keyboard ? (
            <InputBase
              fullWidth
              multiline
              autoFocus
              placeholder="Ta phrase en anglais…"
              value={answer}
              disabled={correct !== null}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (correct !== null) next(); else check(); } }}
              inputProps={{ autoCapitalize: 'sentences', 'aria-label': 'Ta phrase' }}
              sx={{
                px: 2.25, py: 1.75, borderRadius: 4, fontSize: 19, fontWeight: 600, minHeight: 110, alignItems: 'flex-start',
                background: 'rgba(49,39,78,0.05)', border: `2px solid ${tokens.border}`,
                '&.Mui-focused': { borderColor: tokens.violet, boxShadow: '0 0 0 5px rgba(139,108,255,0.18)' },
              }}
            />
          ) : (
            <LayoutGroup>
              <Box
                sx={{
                  minHeight: 116, p: 1.25, borderRadius: 5, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 1,
                  background: 'rgba(49,39,78,0.035)',
                  border: `2px dashed ${correct === null ? tokens.borderStrong : correct ? tokens.mint : tokens.red}`,
                  transition: 'border-color .3s',
                }}
              >
                {placed.length === 0 ? (
                  <Typography color="text.disabled" fontSize={14} fontWeight={600} sx={{ p: 1 }}>Touche les mots dans l’ordre…</Typography>
                ) : null}
                {placed.map((id) => {
                  const tile = byId.get(id);
                  return tile ? (
                    <WordTile key={id} tile={tile} placed disabled={correct !== null} onClick={() => { feedback('tap'); setPlaced((current) => current.filter((item) => item !== id)); }} />
                  ) : null;
                })}
              </Box>

              <Stack direction="row" justifyContent="flex-end" mt={0.75} minHeight={40}>
                {placed.length && correct === null ? (
                  <Button size="small" color="inherit" startIcon={<BackspaceRounded />} onClick={() => setPlaced((current) => current.slice(0, -1))} sx={{ color: 'text.secondary' }}>
                    Effacer
                  </Button>
                ) : null}
              </Stack>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                {tiles.map((tile) => (
                  <Box key={tile.id} sx={{ position: 'relative' }}>
                    {/* Emplacement fantôme pour que les tuiles restantes ne bougent pas. */}
                    <Box sx={{ px: 1.75, height: 46, borderRadius: 3, background: 'rgba(49,39,78,0.045)', fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', color: 'transparent' }}>
                      {tile.word}
                    </Box>
                    {!placed.includes(tile.id) ? (
                      <Box sx={{ position: 'absolute', inset: 0 }}>
                        <WordTile tile={tile} disabled={correct !== null} onClick={() => { feedback('select'); setPlaced((current) => [...current, tile.id]); }} />
                      </Box>
                    ) : null}
                  </Box>
                ))}
              </Box>
            </LayoutGroup>
          )}

          {correct !== null ? (
            <Box mt={2.5}>
              <ResultPanel tone={correct ? 'success' : 'error'} title={correct ? 'Parfait !' : 'Pas tout à fait'} icon={correct ? <CheckRounded /> : <CloseRounded />}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography fontWeight={700} fontSize={17} flex={1}>{exercise.expected}</Typography>
                  <IconButton aria-label="Écouter la phrase" onClick={() => speakEnglish(exercise.expected)} sx={{ color: tokens.violetSoft }}>
                    <VolumeUpRounded />
                  </IconButton>
                </Stack>
              </ResultPanel>
            </Box>
          ) : null}

          <Button
            fullWidth
            type="submit"
            size="large"
            variant="contained"
            color={correct ? 'success' : 'primary'}
            disabled={!builtSentence.trim()}
            sx={{ mt: 2.5, minHeight: 56, fontSize: 17 }}
          >
            {correct !== null ? 'Suivant' : 'Vérifier'}
          </Button>
        </Box>
      </MotionBox>
    </PageLayout>
  );
}

const TileButton = motion.create(styled('button')({}));

function WordTile({ tile, placed = false, disabled, onClick }: { tile: Tile; placed?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <TileButton
      type="button"
      layoutId={tile.id}
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      sx={{
        px: 1.75, height: 46, borderRadius: 3, border: `1.5px solid ${placed ? 'rgba(139,108,255,0.5)' : tokens.borderStrong}`,
        borderBottomWidth: 4, cursor: disabled ? 'default' : 'pointer', font: 'inherit', fontWeight: 700, fontSize: 17,
        color: tokens.text, background: placed ? 'rgba(139,108,255,0.16)' : tokens.surfaceRaised,
        display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', width: placed ? 'auto' : '100%',
      }}
    >
      {tile.word}
    </TileButton>
  );
}
