import { describe, expect, it } from 'vitest';

import { evaluateSentence, normalizeSentence } from '@/helpers/sentenceEvaluation';

describe('sentenceEvaluation', () => {
  it('normalise espaces, casse et ponctuation finale', () => {
    expect(normalizeSentence('  I   have finished. ')).toBe('i have finished');
  });

  it('valide une phrase équivalente', () => {
    expect(evaluateSentence('She has already left!', 'she has already left')).toBe(true);
  });
});
