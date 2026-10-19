import { Check, Delete, Keyboard, LayoutGrid, Volume2, X } from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import { useMemo, useRef, useState, type FormEvent } from 'react';

import { QueryState } from '@/components/common/QueryState';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button, IconButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/form';
import { CelebrationCard, ResultPanel, SessionHeader } from '@/components/ui/SessionChrome';
import { useCombo } from '@/hooks/useCombo';
import { useDailySentences } from '@/hooks/useAiFeatures';
import { evaluateSentence } from '@/helpers/sentenceEvaluation';
import { cn } from '@/lib/utils';
import { feedback } from '@/services/feedbackService';
import { speakEnglish } from '@/services/speechPlaybackService';
import { tokens } from '@/theme';
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
          >
            {keyboard ? <LayoutGrid /> : <Keyboard />}
          </IconButton>
        )}
      />

      <motion.div key={index} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
        <Chip size="sm" label={exercise.hint} className="mb-4 bg-grad-sunrise text-white" />
        {generated && index === 0 ? (
          <p className="mb-2 text-[12.5px] font-bold text-violet-soft">
            Phrases du jour, écrites pour toi avec tes mots à réviser
          </p>
        ) : null}
        <span className="type-overline text-muted">Traduis en anglais</span>
        <p className="mb-6 mt-1 font-display text-[26px] font-bold leading-[1.3] sm:text-[30px]">
          {exercise.prompt}
        </p>

        <form onSubmit={submit}>
          {keyboard ? (
            <Textarea
              autoFocus
              rows={3}
              placeholder="Ta phrase en anglais…"
              value={answer}
              disabled={correct !== null}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (correct !== null) next(); else check(); } }}
              autoCapitalize="sentences"
              aria-label="Ta phrase"
              className="min-h-[110px] resize-none text-[19px] font-semibold"
            />
          ) : (
            <LayoutGroup>
              <div
                className={cn(
                  'flex min-h-[116px] flex-wrap content-start gap-2 rounded-[20px] border-2 border-dashed bg-ink/[0.035] p-2.5 transition-colors duration-300',
                  correct === null ? 'border-border-strong' : correct ? 'border-mint' : 'border-red',
                )}
              >
                {placed.length === 0 ? (
                  <p className="p-2 text-sm font-semibold text-faint">Touche les mots dans l’ordre…</p>
                ) : null}
                {placed.map((id) => {
                  const tile = byId.get(id);
                  return tile ? (
                    <WordTile key={id} tile={tile} placed disabled={correct !== null} onClick={() => { feedback('tap'); setPlaced((current) => current.filter((item) => item !== id)); }} />
                  ) : null;
                })}
              </div>

              <div className="mt-1.5 flex min-h-10 justify-end">
                {placed.length && correct === null ? (
                  <Button size="sm" variant="ghost" onClick={() => setPlaced((current) => current.slice(0, -1))} className="text-muted">
                    <Delete />Effacer
                  </Button>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {tiles.map((tile) => (
                  <div key={tile.id} className="relative">
                    {/* Emplacement fantôme pour que les tuiles restantes ne bougent pas. */}
                    <span className="flex h-[46px] items-center rounded-xl bg-ink/[0.045] px-3.5 text-[17px] font-bold text-transparent">
                      {tile.word}
                    </span>
                    {!placed.includes(tile.id) ? (
                      <div className="absolute inset-0">
                        <WordTile tile={tile} disabled={correct !== null} onClick={() => { feedback('select'); setPlaced((current) => [...current, tile.id]); }} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </LayoutGroup>
          )}

          {correct !== null ? (
            <div className="mt-5">
              <ResultPanel tone={correct ? 'success' : 'error'} title={correct ? 'Parfait !' : 'Pas tout à fait'} icon={correct ? <Check /> : <X />}>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-[17px] font-bold">{exercise.expected}</p>
                  <IconButton aria-label="Écouter la phrase" onClick={() => speakEnglish(exercise.expected)} className="text-violet-soft">
                    <Volume2 />
                  </IconButton>
                </div>
              </ResultPanel>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            variant={correct ? 'success' : 'primary'}
            disabled={!builtSentence.trim()}
            className="mt-5 min-h-14 w-full text-[17px]"
          >
            {correct !== null ? 'Suivant' : 'Vérifier'}
          </Button>
        </form>
      </motion.div>
    </PageLayout>
  );
}

function WordTile({ tile, placed = false, disabled, onClick }: { tile: Tile; placed?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      layoutId={tile.id}
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      className={cn(
        'flex h-[46px] items-center whitespace-nowrap rounded-xl border-[1.5px] border-b-4 px-3.5 text-[17px] font-bold text-fg',
        placed ? 'w-auto border-violet/50 bg-violet/16' : 'w-full border-border-strong bg-surface',
        disabled ? 'cursor-default' : 'cursor-pointer',
      )}
    >
      {tile.word}
    </motion.button>
  );
}
