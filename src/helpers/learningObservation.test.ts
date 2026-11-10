import { describe, expect, it } from 'vitest';

import { isObservation, recentlyDeclared, summarizeLearning } from '@/helpers/learningObservation';
import type { LearningObservation } from '@/types/learningObservation';
import type { PedagogyProfile } from '@/types/pedagogy';

const declaration: LearningObservation = {
  id: '1', at: '2026-11-10T10:00:00Z', source: 'triage', skill: 'recognition',
  targetId: 'although', context: 'although', answer: '', usedHint: false, outcome: 'declared',
};
const profile = (observations: LearningObservation[]): PedagogyProfile => ({ version: 1, evidence: [], observations });

describe('preuves de vocabulaire', () => {
  it('ne confond pas déclaration, rappel par traduction et usage guidé', () => {
    const summary = summarizeLearning(profile([
      declaration,
      { ...declaration, id: '2', source: 'flashcards', skill: 'recall', outcome: 'correct' },
      { ...declaration, id: '3', source: 'lingvist', skill: 'guided_usage', outcome: 'correct', usedHint: true },
    ]));
    expect(summary).toMatchObject({ declared: 1, recall: 1, guided: 0, productions: 0 });
  });
  it('ne compte pas les répétitions d’un mot comme plusieurs mots', () => {
    expect(summarizeLearning(profile([declaration, { ...declaration, id: '2' }])).declared).toBe(1);
  });
  it('réintroduit une déclaration au tri après sept jours', () => {
    const start = Date.parse(declaration.at);
    expect(recentlyDeclared(profile([declaration]), 'although', start)).toBe(true);
    expect(recentlyDeclared(profile([declaration]), 'although', start + 7 * 86_400_000)).toBe(false);
    expect(recentlyDeclared(profile([declaration, { ...declaration, id: '2', outcome: 'focus' }]), 'although', start)).toBe(false);
  });
  it('refuse les sources et constructions inconnues', () => {
    expect(isObservation({ ...declaration, source: 'invented' })).toBe(false);
    expect(isObservation({ ...declaration, constructionId: 'invented' })).toBe(false);
    expect(isObservation({ ...declaration, at: 'invalid' })).toBe(false);
  });
});
