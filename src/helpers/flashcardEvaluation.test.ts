import { describe, expect, it } from 'vitest';

import { evaluateRecall } from '@/helpers/flashcardEvaluation';

describe('evaluateRecall', () => {
  it('accepte un synonyme déclaré', () => expect(evaluateRecall('résister à', 'supporter, résister à')).toBe('success'));
  it('classe une faute légère comme presque correcte', () => expect(evaluateRecall('relyable', 'reliable')).toBe('almost'));
  it('rejette un autre mot', () => expect(evaluateRecall('quiet', 'reliable')).toBe('fail'));
});
