import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { learningApi } from '@/api/learningApi';
import { usePreferences } from '@/hooks/usePreferences';

export function useReadingItems(level: string) {
  return useQuery({
    queryKey: ['reading-items', level],
    queryFn: () => learningApi.getReadingItems(level),
    retry: 1,
  });
}

export function useReadingSegments(itemId: string | null) {
  return useQuery({
    queryKey: ['reading-segments', itemId],
    queryFn: () => learningApi.getReadingSegments(itemId!),
    enabled: Boolean(itemId),
    retry: 1,
  });
}

export function usePromoteReadingVocabulary() {
  const { preferences } = usePreferences();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ level, vocabulary, example }: { level: string; vocabulary: string[]; example: string }) =>
      learningApi.promoteReadingVocabulary(preferences.profile.id, level, vocabulary, example),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['srs-session', preferences.profile.id] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', preferences.profile.id] });
    },
  });
}
