import { describe, expect, it } from 'vitest';

import { evaluateRecall } from '@/helpers/flashcardEvaluation';

describe('evaluateRecall', () => {
  it('accepte un synonyme déclaré', () => expect(evaluateRecall('résister à', 'supporter, résister à')).toBe('success'));
  it('classe une faute légère comme presque correcte', () => expect(evaluateRecall('relyable', 'reliable')).toBe('almost'));
  it('rejette un autre mot', () => expect(evaluateRecall('quiet', 'reliable')).toBe('fail'));
});

describe('evaluateRecall avec une liste de réponses', () => {
  it('accepte chacune des réponses listées', () => expect(evaluateRecall('gamme', ['aller de… à…', 'gamme'])).toBe('success'));
  it('ne découpe pas une réponse listée contenant une virgule', () => expect(evaluateRecall('oui', ['oui, bien sûr'])).toBe('fail'));
  it('ignore la ponctuation et les accents', () => expect(evaluateRecall('aller de a', ['aller de… à…'])).toBe('success'));
  it('rejette une liste vide', () => expect(evaluateRecall('range', [])).toBe('fail'));
});
