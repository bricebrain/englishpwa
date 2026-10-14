import { describe, expect, it } from 'vitest';

import { analyzeAnswerLocally, buildLingvistDecision } from '@/helpers/lingvistAnalysis';
import type { LingvistCard } from '@/types/learning';

const card: LingvistCard = {
  id: 'test',
  lemma: 'think',
  targetPos: 'verb',
  verbFormLabel: 'prétérit',
  expectedAnswer: 'thought',
  sentenceWithGap: 'I ____ about it yesterday.',
  sentenceFull: 'I thought about it yesterday.',
  translationFr: 'J’y ai pensé hier.',
  wordTraductionFr: 'penser',
  grammarHint: 'Le marqueur yesterday appelle le prétérit.',
  level: 'B1',
};

describe('analyse Lingvist', () => {
  it('valide la forme exacte avec une explication', () => {
    const analysis = analyzeAnswerLocally(card, 'thought');
    expect(analysis.result).toBe('success');
    expect(analysis.explanation).toContain('complète naturellement');
  });

  it('repère une petite faute de frappe', () => {
    const analysis = analyzeAnswerLocally(card, 'thougt');
    expect(analysis.result).toBe('almost');
    expect(analysis.commonMistakes.length).toBeGreaterThan(0);
  });

  it('construit un score tenant compte du temps', () => {
    const analysis = analyzeAnswerLocally(card, 'thought');
    const decision = buildLingvistDecision({ card, answer: 'thought', responseTimeMs: 3500, analysis });
    expect(decision.resultKind).toBe('success');
    expect(decision.stars).toBeGreaterThanOrEqual(3);
    expect(decision.metadata.sourceModule).toBe('lingvist');
  });
});
