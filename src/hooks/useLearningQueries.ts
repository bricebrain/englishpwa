import { useQuery } from '@tanstack/react-query';

import { learningApi } from '@/api/learningApi';
import { usePreferences } from '@/hooks/usePreferences';
import type { AssimilLevel } from '@/types/learning';

export function useDashboard() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: ['dashboard', preferences.profile.id],
    queryFn: () => learningApi.getDashboard(preferences.profile.id),
    retry: 1,
  });
}

export function usePreparedContent() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: ['prepared-content', preferences.profile.id],
    queryFn: () => learningApi.getPreparedContent(preferences.profile.id),
    retry: 1,
  });
}

export function useStatistics() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: ['statistics', preferences.profile.id],
    queryFn: () => learningApi.getStatistics(preferences.profile.id),
    retry: 1,
  });
}

export function useSrsSession() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: ['srs-session', preferences.profile.id],
    queryFn: () => learningApi.getSrsSession(preferences.profile.id),
    retry: 1,
  });
}

export function useAssimilLessons(level: AssimilLevel) {
  return useQuery({
    queryKey: ['assimil-lessons', level],
    queryFn: () => learningApi.getAssimilLessons(level),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAssimilProgress() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: ['assimil-progress', preferences.profile.id],
    queryFn: () => learningApi.getAssimilProgress(preferences.profile.id),
    retry: 1,
  });
}
