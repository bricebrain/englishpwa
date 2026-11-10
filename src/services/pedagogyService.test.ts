import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pedagogyService } from '@/services/pedagogyService';
import type { LearningEvidence } from '@/types/pedagogy';

const data = new Map<string, string>();
const event: LearningEvidence = {
  id: 'event', sessionId: 'session', constructionId: 'want_to_verb', exerciseId: 'exercise',
  contextId: 'learning', kind: 'production', usedHint: false, answer: 'I want to learn English',
  at: '2026-11-10T10:00:00Z', evaluation: { outcome: 'correct', explanation: 'Validé' },
};

beforeEach(() => {
  data.clear();
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => data.set(key, value)),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('persistance des preuves par profil', () => {
  it('crée un suivi vide et isole les profils', async () => {
    expect(await pedagogyService.load('alice')).toEqual({ version: 1, evidence: [] });
    await pedagogyService.record('alice', event);
    expect((await pedagogyService.load('alice')).evidence).toEqual([event]);
    expect((await pedagogyService.load('bob')).evidence).toEqual([]);
  });
  it('réessaie de façon idempotente', async () => {
    await pedagogyService.record('alice', event);
    await pedagogyService.record('alice', event);
    expect((await pedagogyService.load('alice')).evidence).toHaveLength(1);
  });
  it.each(['broken', '{"version":2,"evidence":[]}', '{"version":1,"evidence":[{}]}'])('signale les données invalides sans les écraser : %s', async (value) => {
    const key = 'english-fluency:pedagogy:v1:alice';
    data.set(key, value);
    await expect(pedagogyService.load('alice')).rejects.toThrow();
    await expect(pedagogyService.record('alice', event)).rejects.toThrow();
    expect(data.get(key)).toBe(value);
  });
  it('remonte un refus du stockage au lieu d’annoncer une sauvegarde', async () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('quota'); });
    await expect(pedagogyService.record('alice', event)).rejects.toThrow('quota');
  });
});


describe('journal commun et compatibilité', () => {
  const observation = {
    id: 'observation', at: event.at, source: 'triage' as const, skill: 'recognition' as const,
    targetId: 'word', context: 'although', answer: '', usedHint: false, outcome: 'declared' as const,
  };
  it('enrichit un ancien profil sans supprimer ses preuves', async () => {
    await pedagogyService.record('alice', event);
    pedagogyService.recordObservation('alice', observation);
    await pedagogyService.record('alice', { ...event, id: 'event-2' });
    const profile = await pedagogyService.load('alice');
    expect(profile.evidence).toHaveLength(2);
    expect(profile.observations).toEqual([observation]);
    expect((await pedagogyService.load('bob')).observations).toBeUndefined();
  });
  it('conserve des enregistrements concomitants et déduplique les identifiants', async () => {
    await Promise.all([pedagogyService.record('alice', event), pedagogyService.record('alice', { ...event, id: 'second' })]);
    pedagogyService.recordObservation('alice', observation);
    pedagogyService.recordObservation('alice', observation);
    const profile = await pedagogyService.load('alice');
    expect(profile.evidence).toHaveLength(2);
    expect(profile.observations).toHaveLength(1);
  });
  it('préserve un journal corrompu et signale une écriture refusée', async () => {
    const key = 'english-fluency:pedagogy:v1:alice';
    const raw = JSON.stringify({ version: 1, evidence: [], observations: [{}] });
    data.set(key, raw);
    expect(() => pedagogyService.recordObservation('alice', observation)).toThrow();
    expect(data.get(key)).toBe(raw);
    data.clear();
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('quota'); });
    expect(() => pedagogyService.recordObservation('alice', observation)).toThrow('quota');
  });
});
