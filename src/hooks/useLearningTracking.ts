import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { pedagogyService } from '@/services/pedagogyService';
import type { ObservationInput } from '@/types/learningObservation';

export function useLearningTracking(profileId: string) {
  const client = useQueryClient();
  const queryKey = ['pedagogy', profileId];
  const query = useQuery({ queryKey, queryFn: () => pedagogyService.load(profileId), retry: false });
  const [saveError, setSaveError] = useState(false);
  function record(input: ObservationInput): boolean {
    try {
      const profile = pedagogyService.recordObservation(profileId, { ...input, id: crypto.randomUUID(), at: new Date().toISOString() });
      client.setQueryData(queryKey, profile);
      setSaveError(false);
      return true;
    } catch { setSaveError(true); return false; }
  }
  return { query, record, saveError };
}
