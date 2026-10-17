import { describe, expect, it } from 'vitest';

import { learnedRatio } from '@/helpers/progressRatio';

describe('learnedRatio', () => {
  it('calcule la part apprise', () => expect(learnedRatio(1760, 4617)).toBeCloseTo(0.381, 3));
  it('vaut 0 si le total est inconnu au lieu d’exploser', () => expect(learnedRatio(1760, 0)).toBe(0));
  it('est plafonné à 100 %', () => expect(learnedRatio(5000, 4617)).toBe(1));
});
