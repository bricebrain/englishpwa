import { describe, expect, it } from 'vitest';

import { constructions } from '@/constants/pedagogy/constructions';
import { labContent } from '@/constants/pedagogy/labContent';
import { evaluateLabAnswer } from '@/helpers/pedagogyEvaluation';
import { getCompetencyProgress, planLabSession, planMixedSession } from '@/helpers/pedagogyProgress';
import type { LearningEvidence, PedagogyProfile } from '@/types/pedagogy';

const construction = constructions[0]!;
const now = new Date('2026-11-10T10:00:00Z');
const day = 86_400_000;
function evidence(offset: number, extra: Partial<LearningEvidence> = {}): LearningEvidence {
  return {
    id: `event-${offset}`, sessionId: `session-${offset}`, constructionId: construction.id,
    exerciseId: 'exercise', contextId: 'learning', kind: 'production', usedHint: false,
    answer: 'I want to learn English', at: new Date(now.getTime() + offset * day).toISOString(),
    evaluation: { outcome: 'correct', explanation: 'Validé' }, ...extra,
  };
}

describe('correction pédagogique locale', () => {
  const correction = labContent.want_to_verb[0]!.exercises[2]!;
  it('diagnostique l’omission connue de to', () => {
    expect(evaluateLabAnswer(correction, 'I want learn English.')).toMatchObject({ outcome: 'incorrect', errorCategory: 'missing_word' });
  });
  it('valide ponctuation, casse, espaces et contractions relues', () => {
    expect(evaluateLabAnswer(correction, '  I WANT to learn English! ')).toMatchObject({ outcome: 'correct' });
    const negative = labContent.present_simple_negative[0]!.exercises[1]!;
    expect(evaluateLabAnswer(negative, 'She doesn’t work in London.')).toMatchObject({ outcome: 'correct' });
    const polite = labContent.would_like_to_verb[0]!.exercises[1]!;
    expect(evaluateLabAnswer(polite, 'I’d like to book a table.')).toMatchObject({ outcome: 'correct' });
  });
  it('ne transforme pas une variante inconnue ou une réponse fausse en faute certaine', () => {
    expect(evaluateLabAnswer(correction, 'I really want to study English.').outcome).toBe('uncertain');
    expect(evaluateLabAnswer(correction, 'banana').outcome).toBe('uncertain');
  });
  it('garde les données éditoriales cohérentes', () => {
    const ids = new Set<string>();
    for (const item of constructions) {
      expect(item.prerequisites.every((id) => constructions.some((entry) => entry.id === id))).toBe(true);
      for (const context of labContent[item.id]) {
        for (const exercise of [...context.exercises, context.transfer]) {
          expect(ids.has(exercise.id)).toBe(false);
          ids.add(exercise.id);
          expect(exercise.accepted.length).toBeGreaterThan(0);
          for (const answer of exercise.accepted) expect(evaluateLabAnswer(exercise, answer).outcome).toBe('correct');
          for (const error of exercise.knownErrors ?? []) expect(evaluateLabAnswer(exercise, error.answer).outcome).toBe('incorrect');
        }
      }
    }
  });
});

describe('preuves et maîtrise', () => {
  it('ne valide jamais la maîtrise par répétitions immédiates', () => {
    const events = Array.from({ length: 20 }, (_, index) => evidence(0, { id: String(index), sessionId: String(index), kind: 'transfer' }));
    expect(getCompetencyProgress(construction, events)).toMatchObject({ status: 'learning', delayedTransfers: 0, dueAt: new Date(now.getTime() + 2 * day).toISOString() });
  });
  it('exige deux transferts différés dans des contextes distincts', () => {
    const initial = evidence(0);
    const first = evidence(2, { contextId: 'travel', kind: 'transfer' });
    const second = evidence(4, { kind: 'transfer' });
    expect(getCompetencyProgress(construction, [initial, first])).toMatchObject({ status: 'consolidating', delayedTransfers: 1 });
    expect(getCompetencyProgress(construction, [second, initial, first])).toMatchObject({ status: 'mastered', delayedTransfers: 2 });
  });
  it.each([
    { usedHint: true, contextId: 'travel' },
    { contextId: 'learning' },
    { contextId: 'travel', sessionId: 'session-0' },
    { contextId: 'travel', kind: 'production' as const },
    { contextId: 'travel', at: new Date(now.getTime() + day).toISOString() },
  ])('rejette une preuve de transfert insuffisante : %j', (extra) => {
    expect(getCompetencyProgress(construction, [evidence(0), evidence(2, { kind: 'transfer', ...extra })]).delayedTransfers).toBe(0);
  });
  it('exclut les réponses incertaines du score et de l’espacement', () => {
    const before = getCompetencyProgress(construction, [evidence(0)]);
    const after = getCompetencyProgress(construction, [evidence(0), evidence(5, { evaluation: { outcome: 'uncertain', explanation: 'À vérifier' } })]);
    expect(after).toMatchObject({ status: before.status, dueAt: before.dueAt, pendingCount: 1 });
  });
  it('programme plus tôt et réintroduit des indices après une erreur certaine', () => {
    const error = evidence(4, { evaluation: { outcome: 'incorrect', errorCategory: 'missing_word', explanation: 'to' } });
    const finalSuccess = evidence(4.001, { sessionId: error.sessionId });
    const progress = getCompetencyProgress(construction, [evidence(0), evidence(2, { kind: 'transfer', contextId: 'travel' }), error, finalSuccess]);
    expect(progress).toMatchObject({ delayedTransfers: 0, showHints: true });
    expect(Date.parse(progress.dueAt!)).toBe(Date.parse(finalSuccess.at) + day);
  });
});

describe('sélection du parcours', () => {
  const profile = (events: LearningEvidence[]): PedagogyProfile => ({ version: 1, evidence: events });
  it('commence par une découverte sans fuite d’un modèle pendant un transfert', () => {
    const session = planLabSession(profile([]), 'new', now);
    expect(session.exercises[0]!.kind).toBe('comprehension');
    expect(session.isDue).toBe(false);
  });
  it('choisit une nouvelle construction avant une révision anticipée', () => {
    expect(planLabSession(profile([evidence(0)]), 'new', now).construction.id).toBe('would_like_to_verb');
  });
  it('privilégie une révision due dans un autre contexte, avant tout rappel', () => {
    const session = planLabSession(profile([evidence(0)]), 'due', new Date(now.getTime() + 2 * day));
    expect(session.construction.id).toBe('want_to_verb');
    expect(session.context.id).toBe('travel');
    expect(session.exercises[0]!.kind).toBe('transfer');
    expect(session.exercises[0]!.source).toBeUndefined();
    expect(session.exercises[0]!.hint).toBeUndefined();
    expect(session.isDue).toBe(true);
  });
});


describe('production mélangée', () => {
  it('cible plusieurs constructions sans modèle ni certification immédiate de transfert', () => {
    const session = planMixedSession({ version: 1, evidence: [] }, 'mixed', now);
    expect(new Set(session.targets?.map((item) => item.construction.id)).size).toBe(3);
    for (const exercise of session.exercises) {
      expect(exercise.kind).toBe('production');
      expect(exercise.source).toBeUndefined();
      expect(exercise.hint).toBeUndefined();
    }
  });
  it('priorise une construction due et propose un contexte différent', () => {
    const session = planMixedSession({ version: 1, evidence: [evidence(0)] }, 'mixed', new Date(now.getTime() + 3 * day));
    expect(session.targets?.find((item) => item.construction.id === 'want_to_verb')?.context.id).toBe('travel');
  });
});
