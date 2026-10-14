import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { learningApi } from '@/api/learningApi';
import { analyzeLingvistAnswer } from '@/api/lingvistAnalysisApi';
import { buildLingvistDecision } from '@/helpers/lingvistAnalysis';
import { usePreferences } from '@/hooks/usePreferences';
import { clearLingvistProgress, loadLingvistProgress, saveLingvistProgress } from '@/services/sessionStorageService';
import type { LingvistCard, LingvistDecision } from '@/types/learning';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildVariant(card: LingvistCard, variantIndex: number): LingvistCard {
  const examples = card.srsWord?.examples ?? [];
  const example = examples[variantIndex % Math.max(1, examples.length)];
  if (!example || example.en === card.sentenceFull) return card;
  const answerPattern = new RegExp(`\\b${escapeRegex(card.expectedAnswer)}\\b`, 'i');
  const lemmaPattern = new RegExp(`\\b${escapeRegex(card.lemma)}\\b`, 'i');
  const sentenceWithGap = answerPattern.test(example.en)
    ? example.en.replace(answerPattern, '____')
    : example.en.replace(lemmaPattern, '____');
  if (!sentenceWithGap.includes('____')) return card;
  return { ...card, id: `${card.id}-variant-${variantIndex}`, sentenceFull: example.en, sentenceWithGap, translationFr: example.fr };
}

export function useLingvistSession() {
  const { preferences } = usePreferences();
  const queryClient = useQueryClient();
  const initial = useMemo(loadLingvistProgress, []);
  const [cardIndex, setCardIndex] = useState(initial.cardIndex);
  const [correctCount, setCorrectCount] = useState(initial.correctCount);
  const [answer, setAnswer] = useState(initial.answer);
  const [decision, setDecision] = useState<LingvistDecision | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  const startedAtRef = useRef(performance.now());

  const cardsQuery = useQuery({
    queryKey: ['lingvist-session', preferences.profile.id],
    queryFn: () => learningApi.getLingvistCards(preferences.profile.id, 20),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const cards = cardsQuery.data ?? [];
  const safeIndex = cards.length ? Math.min(cardIndex, cards.length - 1) : 0;
  const baseCard = cards[safeIndex];
  const currentCard = baseCard ? buildVariant(baseCard, variantIndex) : undefined;
  const completed = cards.length > 0 && cardIndex >= cards.length;

  const attemptMutation = useMutation({
    mutationFn: async ({ card, value }: { card: LingvistCard; value: string }) => {
      const responseTimeMs = Math.max(400, performance.now() - startedAtRef.current);
      const analysis = await analyzeLingvistAnswer(card, value);
      const nextDecision = buildLingvistDecision({ card, answer: value, responseTimeMs, analysis });
      await learningApi.submitLingvistAnswer(preferences.profile.id, card, value, nextDecision);
      return nextDecision;
    },
    onSuccess: (nextDecision) => {
      setDecision(nextDecision);
      if (nextDecision.resultKind === 'success') setCorrectCount((value) => value + 1);
      void queryClient.invalidateQueries({ queryKey: ['dashboard', preferences.profile.id] });
    },
  });

  const knownMutation = useMutation({
    mutationFn: (wordId: string) => learningApi.markWordsKnown(preferences.profile.id, [wordId], 'user_marked_known'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['srs-session', preferences.profile.id] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', preferences.profile.id] });
    },
  });

  useEffect(() => {
    saveLingvistProgress({ cardIndex, correctCount, answer });
  }, [answer, cardIndex, correctCount]);

  useEffect(() => {
    startedAtRef.current = performance.now();
  }, [cardIndex, variantIndex]);

  const checkAnswer = () => {
    if (!currentCard || !answer.trim() || decision || attemptMutation.isPending) return;
    attemptMutation.mutate({ card: currentCard, value: answer });
  };

  const reveal = () => {
    if (!currentCard || decision || attemptMutation.isPending) return;
    setAnswer(currentCard.expectedAnswer);
    attemptMutation.mutate({ card: currentCard, value: '' }, {
      onSuccess: (nextDecision) => setDecision({ ...nextDecision, resultKind: 'dont_know', grade: 'again' }),
    });
  };

  const next = () => {
    setCardIndex((value) => value + 1);
    setAnswer('');
    setDecision(null);
    setHintShown(false);
    setVariantIndex(0);
    attemptMutation.reset();
  };

  const markAlreadyKnown = () => {
    if (!currentCard || decision || knownMutation.isPending) return;
    knownMutation.mutate(currentCard.wordId ?? currentCard.id, { onSuccess: next });
  };

  const restart = () => {
    clearLingvistProgress();
    setCardIndex(0);
    setCorrectCount(0);
    setAnswer('');
    setDecision(null);
    setHintShown(false);
    setVariantIndex(0);
  };

  return {
    ...cardsQuery,
    cards,
    currentCard,
    cardIndex,
    safeIndex,
    correctCount,
    answer,
    decision,
    hintShown,
    completed,
    setAnswer,
    checkAnswer,
    reveal,
    requestHint: () => setHintShown(true),
    refreshVariant: () => { setVariantIndex((value) => value + 1); setAnswer(''); setDecision(null); },
    markAlreadyKnown,
    isMarkingKnown: knownMutation.isPending,
    isAnalyzing: attemptMutation.isPending,
    attemptError: attemptMutation.isError,
    next,
    restart,
  };
}
