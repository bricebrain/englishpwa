import { describe, expect, it } from 'vitest';

import {
  getContentChunks,
  getContentDurationLabel,
  getContentGrammarPoints,
  getContentSegments,
  getEnglishScript,
  getFrenchTranslation,
} from '@/helpers/preparedContent';
import type { PreparedContent } from '@/types/learning';

function contenu(metadata: Record<string, unknown>, body = 'Hello everyone.'): PreparedContent {
  return {
    id: 'demo', title: 'Démo', source: 'tech', durationLabel: 'Audio', language: 'Anglais',
    body, metadata, publishedAt: '2026-10-16T00:00:00Z',
  };
}

// Forme envoyée par l'atelier English Fluency (convert/pipeline.py)
const atelier = contenu({
  schemaVersion: 2,
  audioLanguage: 'en',
  transcriptLanguage: 'fr',
  textEn: 'Hello everyone.\nWe need to figure it out.',
  textFr: 'Bonjour à tous.\nNous devons comprendre.',
  durationLabel: '12 min',
  segments: [
    { id: 's001', en: 'Hello everyone.', fr: 'Bonjour à tous.', startMs: null, endMs: null },
    { id: 's002', en: 'We need to figure it out.', fr: 'Nous devons comprendre.' },
    { id: 's003', en: '', fr: 'ignoré' },
  ],
  chunks: [
    { id: 'c001', expression: 'figure out', meaningFr: 'comprendre', exampleEn: "I can't figure it out.", level: 'B1', type: 'phrasal_verb', sourceSegmentId: 's002' },
    { expression: 'sans sens' },
  ],
  grammarPoints: [
    { id: 'g001', title: 'Need to + infinitif', explanationFr: 'Exprime une nécessité.', level: 'A2', sourceSegmentId: 's002' },
  ],
});

describe('preparedContent — contenus bilingues de l’atelier', () => {
  it('lit les textes anglais et français', () => {
    expect(getEnglishScript(atelier)).toBe('Hello everyone.\nWe need to figure it out.');
    expect(getFrenchTranslation(atelier)).toBe('Bonjour à tous.\nNous devons comprendre.');
  });

  it('lit les segments appariés et ignore les segments vides', () => {
    expect(getContentSegments(atelier)).toEqual([
      { id: 's001', en: 'Hello everyone.', fr: 'Bonjour à tous.', startMs: null, endMs: null },
      { id: 's002', en: 'We need to figure it out.', fr: 'Nous devons comprendre.', startMs: null, endMs: null },
    ]);
  });

  it('lit les chunks valides seulement', () => {
    const chunks = getContentChunks(atelier);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ expression: 'figure out', meaningFr: 'comprendre', type: 'phrasal_verb', level: 'B1' });
  });

  it('lit les points de grammaire et la durée', () => {
    expect(getContentGrammarPoints(atelier)[0]).toMatchObject({ title: 'Need to + infinitif', level: 'A2' });
    expect(getContentDurationLabel(atelier)).toBe('12 min');
  });

  it('reste tolérant avec les anciens contenus sans ces champs', () => {
    const ancien = contenu({ chunks: 'pas une liste', segments: [null, 3] });
    expect(getContentSegments(ancien)).toEqual([]);
    expect(getContentChunks(ancien)).toEqual([]);
    expect(getContentGrammarPoints(ancien)).toEqual([]);
    expect(getContentDurationLabel(ancien)).toBeNull();
  });
});
