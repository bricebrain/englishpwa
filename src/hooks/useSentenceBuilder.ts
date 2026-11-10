import { useMemo, useRef, useState, type FormEvent } from 'react';

import { useLearningTracking } from '@/hooks/useLearningTracking';
import { usePreferences } from '@/hooks/usePreferences';
import { useCombo } from '@/hooks/useCombo';
import { useDailySentences } from '@/hooks/useAiFeatures';
import { evaluateOpenAnswer } from '@/helpers/openAnswerEvaluation';
import { feedback } from '@/services/feedbackService';
import type { SentenceExercise } from '@/types/aiFeatures';
import type { Evaluation } from '@/types/pedagogy';

/** Exercices de secours si les phrases du jour ne sont pas disponibles. */
const FALLBACK_EXERCISES: SentenceExercise[] = [
  { prompt: 'Je travaille ici depuis trois ans.', expected: 'I have worked here for three years', hint: 'Present perfect + for', distractors: ['since', 'work', 'am'] },
  { prompt: 'Si j’avais plus de temps, je lirais davantage.', expected: 'If I had more time, I would read more', hint: 'Second conditional', distractors: ['will', 'have', 'reading'] },
  { prompt: 'Elle avait déjà quitté le bureau.', expected: 'She had already left the office', hint: 'Past perfect', distractors: ['has', 'leaved', 'yet'] },
];

export interface Tile { id: string; word: string }

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

export function useSentenceBuilder() {
  const { preferences } = usePreferences();
  const tracking = useLearningTracking(preferences.profile.id);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [placed, setPlaced] = useState<string[]>([]);
  const [keyboard, setKeyboard] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const correct = evaluation ? evaluation.outcome === 'correct' : null;
  const pending = useRef(0);
  const attempted = useRef(false);
  const score = useRef(0);
  const combo = useCombo(15);
  const daily = useDailySentences();
  const exercisesRef = useRef<SentenceExercise[] | null>(null);
  if (!daily.isLoading && !exercisesRef.current) {
    exercisesRef.current = daily.data?.exercises?.length ? daily.data.exercises : FALLBACK_EXERCISES;
  }
  const exercises = exercisesRef.current ?? FALLBACK_EXERCISES;
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
    if (!builtSentence.trim() || attempted.current) return;
    attempted.current = true;
    const verdict = evaluateOpenAnswer(builtSentence, [exercise.expected]);
    tracking.record({ source: 'sentence_builder', skill: 'guided_writing', targetId: exercise.prompt,
      context: exercise.prompt, answer: builtSentence, usedHint: true, outcome: verdict.outcome });
    setEvaluation(verdict);
    if (verdict.outcome === 'correct') { score.current += 1; combo.hit(); }
    else pending.current += 1;
  };

  const next = () => {
    if (!evaluation || !attempted.current) return;
    attempted.current = false;
    feedback('tap');
    setIndex((value) => value + 1);
    setAnswer('');
    setPlaced([]);
    setEvaluation(null);
    attempted.current = false;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (correct !== null) next();
    else check();
  };

  const restart = () => {
    score.current = 0;
    pending.current = 0;
    combo.reset();
    setIndex(0);
    setPlaced([]);
    setAnswer('');
    setEvaluation(null);
    attempted.current = false;
  };

  return {
    trackingError: tracking.saveError, daily, exercise, exercises, generated, completed, index, answer, setAnswer,
    placed, setPlaced, keyboard, setKeyboard, correct, evaluation, score, pending, combo,
    tiles, byId, builtSentence, check, next, submit, restart,
  };
}
