import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { evaluateLabAnswer } from '@/helpers/pedagogyEvaluation';
import { getPedagogyProgress, planLabSession, planMixedSession } from '@/helpers/pedagogyProgress';
import { pedagogyService } from '@/services/pedagogyService';
import type { LabSession, LearningEvidence } from '@/types/pedagogy';

export function useSentenceLab(profileId: string) {
  const client = useQueryClient();
  const queryKey = ['pedagogy', profileId];
  const query = useQuery({ queryKey, queryFn: () => pedagogyService.load(profileId), retry: false });
  const [session, setSession] = useState<LabSession | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [usedHint, setUsedHint] = useState(false);
  const [result, setResult] = useState<LearningEvidence | null>(null);
  const pendingEvidence = useRef<LearningEvidence | null>(null);
  const submitting = useRef(false);
  const mutation = useMutation({
    mutationFn: (evidence: LearningEvidence) => pedagogyService.record(profileId, evidence),
    onSuccess: (profile) => client.setQueryData(queryKey, profile),
  });
  const exercise = session?.exercises[index];
  const canShowHint = Boolean(exercise?.hint && exercise.kind !== 'production' && exercise.kind !== 'transfer');
  const hintVisible = canShowHint && (usedHint || Boolean(session?.showHints));

  const target = session?.targets?.[index];

  function start(mode: 'guided' | 'mixed' = 'guided') {
    if (!query.data) return;
    setSession((mode === 'mixed' ? planMixedSession : planLabSession)(query.data, crypto.randomUUID()));
    setIndex(0);
    setAnswer('');
    setResult(null);
    setUsedHint(false);
    pendingEvidence.current = null;
    mutation.reset();
  }

  async function validate() {
    if (!session || !exercise || !answer.trim() || result || submitting.current) return;
    submitting.current = true;
    // Le même identifiant est conservé si l’utilisateur réessaie après une erreur de stockage.
    const evidence: LearningEvidence = pendingEvidence.current ?? {
      id: crypto.randomUUID(), sessionId: session.id, constructionId: (target?.construction ?? session.construction).id,
      contextId: (target?.context ?? session.context).id, exerciseId: exercise.id, kind: exercise.kind,
      usedHint: hintVisible, answer: answer.trim(), at: new Date().toISOString(),
      evaluation: evaluateLabAnswer(exercise, answer),
    };
    pendingEvidence.current = evidence;
    try {
      await mutation.mutateAsync(evidence);
      setResult(evidence);
    } catch { /* Le formulaire affiche l’erreur et permet de réessayer le même envoi. */ }
    finally { submitting.current = false; }
  }

  function next() {
    if (!result || !pendingEvidence.current) return;
    pendingEvidence.current = null;
    setSession((current) => current ? {
      ...current,
      showHints: result.evaluation.outcome !== 'correct' || result.usedHint,
    } : current);
    setIndex((value) => value + 1);
    setAnswer('');
    setUsedHint(false);
    setResult(null);
    pendingEvidence.current = null;
    mutation.reset();
  }

  return {
    query, session, exercise, context: target?.context ?? session?.context, index, answer, setAnswer, result, start, validate, next,
    hintVisible, canShowHint, revealHint: () => setUsedHint(true),
    isSaving: mutation.isPending, saveError: mutation.isError,
    answerLocked: Boolean(pendingEvidence.current),
    completed: Boolean(session && index >= session.exercises.length),
    progress: query.data ? getPedagogyProgress(query.data) : [],
    sessionEvidence: query.data?.evidence.filter((item) => item.sessionId === session?.id) ?? [],
  };
}
