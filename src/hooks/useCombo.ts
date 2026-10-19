import { useCallback, useRef, useState } from 'react';

import { celebrate, feedback } from '@/services/feedbackService';
import { awardXp, recordCombo, xpForCorrect } from '@/services/xpService';

/**
 * Gère la série de bonnes réponses d'une session et déclenche les retours
 * sensoriels associés (vibration, XP).
 */
export function useCombo(baseXp = 10) {
  const comboRef = useRef(0);
  const [combo, setCombo] = useState(0);

  const update = useCallback((value: number) => {
    comboRef.current = value;
    setCombo(value);
  }, []);

  const hit = useCallback((label?: string) => {
    const previous = comboRef.current;
    const next = previous + 1;
    update(next);
    feedback('success');
    awardXp(xpForCorrect(baseXp, previous), label);
    recordCombo(next);
    if (next % 5 === 0) void celebrate('small');
  }, [baseXp, update]);

  const almost = useCallback(() => {
    feedback('almost');
    awardXp(Math.round(baseXp / 2));
    update(0);
  }, [baseXp, update]);

  const miss = useCallback(() => {
    feedback('error');
    update(0);
  }, [update]);

  const reset = useCallback(() => update(0), [update]);

  return { combo, hit, almost, miss, reset };
}
