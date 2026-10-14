import { useSyncExternalStore } from 'react';

import { getXpState, levelFromXp, subscribeXp, todayXp } from '@/services/xpService';

export function useXp() {
  const state = useSyncExternalStore(subscribeXp, getXpState, getXpState);
  return { ...state, ...levelFromXp(state.totalXp), todayXp: todayXp(state) };
}
