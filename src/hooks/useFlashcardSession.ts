import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { learningApi } from '@/api/learningApi';
import { evaluateRecall, type RecallResult } from '@/helpers/flashcardEvaluation';
import {
  getVocabularyAcceptedAnswers,
  getVocabularyDisplayForm,
  getVocabularyLemma,
  getVocabularyTranslation,
} from '@/helpers/vocabularyDisplay';
import { useLearningTracking } from '@/hooks/useLearningTracking';
import { usePreferences } from '@/hooks/usePreferences';
import { useSrsSession } from '@/hooks/useLearningQueries';
import type { ReviewGrade, ReviewMode, SrsWord } from '@/types/learning';

export type ReviewDirection = 'en-to-fr' | 'fr-to-en';

function poolWords(words: SrsWord[], mode: ReviewMode) {
  if (mode === 'new') return words.filter((word) => word.status === 'new');
  if (mode === 'due') return words.filter((word) => word.status !== 'new');
  return words;
}

function resultGrade(result: RecallResult): ReviewGrade {
  if (result === 'success') return 'good';
  if (result === 'almost') return 'hard';
  return 'again';
}

export function useFlashcardSession(mode: ReviewMode) {
  const query = useSrsSession();
  const queryClient = useQueryClient();
  const { preferences } = usePreferences();
  const tracking = useLearningTracking(preferences.profile.id);
  const [direction, setDirection] = useState<ReviewDirection>('en-to-fr');
  const [queue, setQueue] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<RecallResult | null>(null);
  const [flipped, setFlipped] = useState(false);
  const attempted = useRef(false);
  const revealed = useRef(false);
  const [done, setDone] = useState(0);

  const words = useMemo(() => poolWords(query.data?.words ?? [], mode), [mode, query.data?.words]);
  const byId = useMemo(() => new Map(words.map((word) => [word.id, word])), [words]);

  useEffect(() => {
    attempted.current = false;
    revealed.current = false;
    setQueue(words.map((word) => word.id));
    setDone(0);
    setAnswer('');
    setResult(null);
    setFlipped(false);
  }, [mode, words]);

  const currentWord = queue.length ? byId.get(queue[0]!) ?? null : null;
  const displayForm = currentWord ? getVocabularyDisplayForm(currentWord) : '';
  const translation = currentWord ? getVocabularyTranslation(currentWord) ?? '?' : '';
  const frontText = currentWord ? (direction === 'en-to-fr' ? displayForm : translation) : '';
  const expected = currentWord ? (direction === 'en-to-fr' ? translation : getVocabularyLemma(currentWord)) : '';
  /** Ce que la synthèse vocale prononce : le lemme, jamais « to + verbe ». */
  const spokenWord = currentWord ? getVocabularyLemma(currentWord) : '';

  const mutation = useMutation({
    mutationFn: ({ word, grade }: { word: SrsWord; grade: ReviewGrade }) =>
      learningApi.reviewWord(preferences.profile.id, word.id, word, grade),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard', preferences.profile.id] });
      void queryClient.invalidateQueries({ queryKey: ['statistics', preferences.profile.id] });
    },
  });

  const validate = () => {
    if (!currentWord || result || attempted.current) return;
    attempted.current = true;
    const nextResult = revealed.current ? 'fail' : evaluateRecall(answer, getVocabularyAcceptedAnswers(currentWord, direction));
    tracking.record({ source: 'flashcards', skill: direction === 'en-to-fr' ? 'recognition' : 'recall',
      targetId: currentWord.id, context: direction, answer, usedHint: revealed.current,
      outcome: nextResult === 'success' ? 'correct' : nextResult === 'almost' ? 'uncertain' : 'incorrect' });
    setResult(nextResult);
    mutation.mutate({ word: currentWord, grade: resultGrade(nextResult) });
  };

  const next = () => {
    if (!currentWord || !result || !attempted.current) return;
    attempted.current = false;
    revealed.current = false;
    const remaining = queue.slice(1);
    const offset = result === 'fail' ? Math.min(3, remaining.length) : result === 'almost' ? Math.min(6, remaining.length) : -1;
    setQueue(offset >= 0 ? [...remaining.slice(0, offset), currentWord.id, ...remaining.slice(offset)] : remaining);
    setDone((value) => value + 1);
    setAnswer('');
    setResult(null);
    setFlipped(false);
  };

  const shuffle = () => {
    if (result || mutation.isPending) return;
    setQueue((current) => [...current].sort(() => Math.random() - 0.5));
  };

  return {
    ...query,
    direction, setDirection: (value: ReviewDirection) => {
      if (result || mutation.isPending) return;
      setDirection(value);
      setAnswer('');
    }, currentWord, frontText, expected, spokenWord, answer, setAnswer,
    result, flipped, setFlipped: (value: boolean) => {
      if (value) revealed.current = true;
      setFlipped(value);
    }, done, total: Math.max(words.length, done + queue.length),
    dueCount: query.data?.dueCount ?? 0, newCount: query.data?.newCount ?? 0,
    trackingError: tracking.saveError,
    isSaving: mutation.isPending, validate, next, shuffle,
  };
}
