import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';

import { learningApi } from '@/api/learningApi';
import { recentlyDeclaredIds } from '@/helpers/learningObservation';
import { useLearningTracking } from '@/hooks/useLearningTracking';
import { usePreferences } from '@/hooks/usePreferences';
import type { SrsTriageCandidate } from '@/types/learning';

export type TriageAction = 'known' | 'focus';

export function useTriageSession() {
  const { preferences } = usePreferences();
  const queryClient = useQueryClient();
  const tracking = useLearningTracking(preferences.profile.id);
  const choosing = useRef(new Set<string>());
  const [triageNow, setTriageNow] = useState(Date.now);
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(() => new Set());
  const [knownCount, setKnownCount] = useState(0);
  const [focusCount, setFocusCount] = useState(0);

  const query = useQuery({
    queryKey: ['srs-triage', preferences.profile.id],
    queryFn: () => learningApi.getTriageCandidates(preferences.profile.id),
    retry: 1,
  });

  const declaredIds = useMemo(() => tracking.query.data
    ? recentlyDeclaredIds(tracking.query.data, triageNow) : new Set<string>(), [tracking.query.data, triageNow]);
  const candidates = useMemo(
    () => (query.data ?? []).filter((candidate) => !removedIds.has(candidate.id) && !declaredIds.has(candidate.id)),
    [query.data, removedIds, declaredIds],
  );

  const countFor = (action: TriageAction, delta: number) => {
    if (action === 'known') setKnownCount((value) => value + delta);
    else setFocusCount((value) => value + delta);
  };

  // Mise à jour optimiste : la carte disparaît dès le geste, et revient si l'enregistrement échoue.
  const mutation = useMutation({
    mutationFn: async ({ candidate, action }: { candidate: SrsTriageCandidate; action: TriageAction }) => {
      if (action === 'focus') await learningApi.markWordsKnown(preferences.profile.id, [candidate.id], 'triage_focus');
      const saved = tracking.record({ source: 'triage', skill: 'recognition', targetId: candidate.id,
        context: candidate.mot, answer: '', usedHint: false, outcome: action === 'known' ? 'declared' : 'focus' });
      if (!saved) throw new Error('Déclaration non enregistrée');
    },
    onMutate: ({ candidate, action }) => {
      setRemovedIds((current) => new Set(current).add(candidate.id));
      countFor(action, 1);
    },
    onError: (_, { candidate, action }) => {
      choosing.current.delete(candidate.id);
      setRemovedIds((current) => {
        const next = new Set(current);
        next.delete(candidate.id);
        return next;
      });
      countFor(action, -1);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['srs-session', preferences.profile.id] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', preferences.profile.id] });
      void queryClient.invalidateQueries({ queryKey: ['statistics', preferences.profile.id] });
    },
  });

  const toggleTranslation = (wordId: string) => {
    setVisibleTranslations((current) => {
      const next = new Set(current);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
  };

  const refresh = async () => {
    choosing.current.clear();
    setTriageNow(Date.now());
    setRemovedIds(new Set());
    setVisibleTranslations(new Set());
    await query.refetch();
  };

  return {
    ...query,
    candidates,
    visibleTranslations,
    knownCount,
    focusCount,
    saveError: mutation.isError,
    toggleTranslation,
    applyChoice: (candidate: SrsTriageCandidate, action: TriageAction) => {
      if (choosing.current.has(candidate.id)) return;
      choosing.current.add(candidate.id);
      mutation.mutate({ candidate, action });
    },
    refresh,
  };
}
