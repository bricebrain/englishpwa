import { useQuery } from '@tanstack/react-query';

import { aiFeaturesApi } from '@/api/aiFeaturesApi';
import { usePreferences } from '@/hooks/usePreferences';
import type { PassageSource } from '@/types/aiFeatures';

export function useSemanticSearch(query: string, source?: PassageSource) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['semantic-search', trimmed, source ?? 'all'],
    queryFn: () => aiFeaturesApi.searchSemantic(trimmed, source),
    enabled: trimmed.length >= 2,
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });
}

/** Phrases réelles des contenus qui contiennent le mot (encart « Dans tes contenus »). */
export function useWordContexts(word: string | undefined, enabled = true) {
  const term = word?.trim() ?? '';
  return useQuery({
    queryKey: ['word-contexts', term.toLowerCase()],
    queryFn: () => aiFeaturesApi.getWordContexts(term),
    enabled: enabled && term.length >= 2,
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });
}

export function useDailySentences() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: ['daily-sentences', preferences.profile.id, new Date().toISOString().slice(0, 10)],
    queryFn: () => aiFeaturesApi.getDailySentences(preferences.profile.id),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });
}

export function useDailyStory() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: ['daily-story', preferences.profile.id, new Date().toISOString().slice(0, 10)],
    queryFn: () => aiFeaturesApi.getDailyStory(preferences.profile.id),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });
}
