/**
 * LOT 1 — contenus sans audio, badges de voix et de source, segment en cours.
 */
import { describe, expect, it } from 'vitest';

import {
  findActiveSegmentId, getAudioVoiceLabel, getContentSegments, getEnglishScript, getFrenchTranslation,
  getSourceKindLabel, getSourceLink, hasContentAudio, isTextOnlyContent,
} from '@/helpers/preparedContent';
import type { PreparedContent } from '@/types/learning';

function item(metadata: Record<string, unknown>, extra: Partial<PreparedContent> = {}): PreparedContent {
  return {
    id: 'x', title: 'Titre', source: 'tech', durationLabel: 'Texte', language: 'Anglais', body: 'Interest rates went up.',
    publishedAt: '2026-10-16', metadata, ...extra,
  };
}

// Forme publiée par l'atelier pour un article collé, sans audio (pipeline.payload_distant)
const articleSansAudio = item({
  schemaVersion: 2, sourceType: 'article_url', contentType: 'article', sourceUrl: 'https://news.example/tech',
  sourceLanguage: 'en', audioLanguage: null, audioOrigin: null, transcriptLanguage: 'en',
  textEn: 'Interest rates went up.', textFr: 'Les taux ont augmenté.', durationLabel: 'Texte',
  segments: [{ id: 's001', en: 'Interest rates went up.', fr: 'Les taux ont augmenté.', startMs: null, endMs: null }],
  readingAvailable: true, listeningAvailable: false,
}, { audioR2Key: null });

describe('contenu texte sans audio (EF-06, EF-26)', () => {
  it('reste lisible : script, traduction et segments', () => {
    expect(hasContentAudio(articleSansAudio)).toBe(false);
    expect(isTextOnlyContent(articleSansAudio)).toBe(true);
    expect(getEnglishScript(articleSansAudio)).toBe('Interest rates went up.');
    expect(getFrenchTranslation(articleSansAudio)).toBe('Les taux ont augmenté.');
    expect(getContentSegments(articleSansAudio)).toEqual([
      { id: 's001', en: 'Interest rates went up.', fr: 'Les taux ont augmenté.', startMs: null, endMs: null },
    ]);
  });

  it('pas de badge de voix sans audio', () => {
    expect(getAudioVoiceLabel(articleSansAudio)).toBeNull();
  });

  it('la production personnelle ne confond pas le texte brut avec une traduction', () => {
    const production = item({
      sourceType: 'personal_transcript', contentType: 'personal_output', sourceLanguage: 'en',
      textEn: 'Yesterday I went to the market.', textFr: 'Hier, je suis allé au marché.',
      personalOriginalText: 'Yesterday I have went to the market.',
    });
    expect(getFrenchTranslation(production)).toBe('Hier, je suis allé au marché.');
    expect(getSourceKindLabel(production)).toBe('Production personnelle');
  });
});

describe('badges', () => {
  it('voix authentique / Kokoro', () => {
    expect(getAudioVoiceLabel(item({ audioOrigin: 'original' }, { audioR2Key: 'prepared-content/a.mp3' }))).toBe('Voix authentique');
    expect(getAudioVoiceLabel(item({ audioOrigin: 'kokoro_tts' }, { audioR2Key: 'prepared-content/a.mp3' }))).toBe('Kokoro — voix de synthèse');
    expect(getAudioVoiceLabel(item({}, { audioR2Key: 'tts/x.mp3' }))).toBeNull();
  });

  it('nature de la source', () => {
    expect(getSourceKindLabel(articleSansAudio)).toBe('Article');
    expect(getSourceKindLabel(item({ sourceType: 'pasted_text', contentType: 'other' }))).toBe('Texte');
    expect(getSourceKindLabel(item({ sourceType: 'pasted_text', contentType: 'transcript' }))).toBe('Transcription');
    expect(getSourceKindLabel(item({ sourceType: 'youtube' }))).toBe('Vidéo');
    expect(getSourceKindLabel(item({}))).toBeNull();
  });

  it('lien de provenance seulement en http(s)', () => {
    expect(getSourceLink(articleSansAudio)).toBe('https://news.example/tech');
    expect(getSourceLink(item({ sourceUrl: 'javascript:alert(1)' }))).toBeNull();
    expect(getSourceLink(item({ sourceUrl: '' }))).toBeNull();
  });
});

describe('segment en cours (timeupdate)', () => {
  const horodate = getContentSegments(item({
    segments: [
      { id: 's001', en: 'One.', startMs: 0, endMs: 1000 },
      { id: 's002', en: 'Two.', startMs: 1200, endMs: 2500 },
      { id: 's003', en: 'Three.', startMs: 'x', endMs: null },
    ],
  }));

  it('lit les timings et ignore les valeurs invalides', () => {
    expect(horodate.map((s) => [s.startMs, s.endMs])).toEqual([[0, 1000], [1200, 2500], [null, null]]);
  });

  it('trouve le segment, ou aucun dans un silence', () => {
    expect(findActiveSegmentId(horodate, 500)).toBe('s001');
    expect(findActiveSegmentId(horodate, 1100)).toBeNull();
    expect(findActiveSegmentId(horodate, 1200)).toBe('s002');
    expect(findActiveSegmentId(horodate, 9000)).toBeNull();
  });
});
