import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { learningApi } from '@/api/learningApi';
import { usePreferences } from '@/hooks/usePreferences';
import type { SrsTriageCandidate } from '@/types/learning';

export type TriageAction = 'known' | 'focus';

export function useTriageSession() {
  const { preferences } = usePreferences();
  const queryClient = useQueryClient();
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(() => new Set());
  const [knownCount, setKnownCount] = useState(0);
  const [focusCount, setFocusCount] = useState(0);

  const query = useQuery({
    queryKey: ['srs-triage', preferences.profile.id],
    queryFn: () => learningApi.getTriageCandidates(preferences.profile.id),
    retry: 1,
  });

  const candidates = useMemo(
    () => (query.data ?? []).filter((candidate) => !removedIds.has(candidate.id)),
    [query.data, removedIds],
  );

  const countFor = (action: TriageAction, delta: number) => {
    if (action === 'known') setKnownCount((value) => value + delta);
    else setFocusCount((value) => value + delta);
  };

  // Mise à jour optimiste : la carte disparaît dès le geste, et revient si l'enregistrement échoue.
  const mutation = useMutation({
    mutationFn: ({ candidate, action }: { candidate: SrsTriageCandidate; action: TriageAction }) =>
      learningApi.markWordsKnown(
        preferences.profile.id,
        [candidate.id],
        action === 'known' ? 'user_marked_known' : 'triage_focus',
      ),
    onMutate: ({ candidate, action }) => {
      setRemovedIds((current) => new Set(current).add(candidate.id));
      countFor(action, 1);
    },
    onError: (_, { candidate, action }) => {
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
    applyChoice: (candidate: SrsTriageCandidate, action: TriageAction) => mutation.mutate({ candidate, action }),
    refresh,
  };
}
