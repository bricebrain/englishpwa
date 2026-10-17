import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { learningApi } from '@/api/learningApi';
import { analyzeLingvistAnswer } from '@/api/lingvistAnalysisApi';
import { buildLingvistDecision } from '@/helpers/lingvistAnalysis';
import { getVocabularyExamples, getVocabularyLemma } from '@/helpers/vocabularyDisplay';
import { usePreferences } from '@/hooks/usePreferences';
import { clearLingvistProgress, loadLingvistProgress, saveLingvistProgress } from '@/services/sessionStorageService';
import type { LingvistCard, LingvistDecision } from '@/types/learning';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Variante de phrase : exemples des sens enrichis puis exemples historiques.
 * Le trou remplace la forme exigée par la phrase ; si seul le lemme y figure,
 * c'est cette forme-là qui devient la réponse attendue (jamais « to + verbe »).
 */
function buildVariant(card: LingvistCard, variantIndex: number): LingvistCard {
  if (variantIndex <= 0) return card; // la phrase préparée par le Worker passe en premier
  const examples = getVocabularyExamples(card.srsWord).filter((item) => item.en !== card.sentenceFull);
  const example = examples[(variantIndex - 1) % Math.max(1, examples.length)];
  if (!example) return card;
  const lemma = card.srsWord ? getVocabularyLemma(card.srsWord) : card.lemma;
  const patterns = [card.expectedAnswer, card.lemma, lemma]
    .filter(Boolean)
    .map((value) => new RegExp(`\\b${escapeRegex(value)}\\b`, 'i'));
  const pattern = patterns.find((candidate) => candidate.test(example.en));
  const match = pattern ? example.en.match(pattern)?.[0] : undefined;
  if (!pattern || !match) return card;
  return {
    ...card,
    id: `${card.id}-variant-${variantIndex}`,
    sentenceFull: example.en,
    sentenceWithGap: example.en.replace(pattern, '____'),
    translationFr: example.fr || card.translationFr,
    expectedAnswer: match.toLocaleLowerCase('en') === card.expectedAnswer.toLocaleLowerCase('en') ? card.expectedAnswer : match,
  };
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
