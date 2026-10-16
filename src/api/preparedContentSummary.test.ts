/**
 * LOT 1 — liste résumée (GET /content?view=summary) et détail à la demande
 * (GET /content/:id).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

vi.mock('@/api/httpClient', () => ({
  hasRemoteApi: true,
  apiRequest: (path: string, init?: RequestInit) => apiRequest(path, init),
  resolveApiAsset: (path: string) => `/api${path}`,
}));

const { learningApi } = await import('@/api/learningApi');
const {
  getContentCounts, getContentSegments, getContentSummary, getEnglishScript, getFrenchTranslation, isContentSummary,
} = await import('@/helpers/preparedContent');

// Forme renvoyée par le Worker en vue résumée (src/content.ts, summarizeContent)
const resume = {
  id: 'cyber', profileId: 'default', title: 'WTF is happening with Cybersecurity?', body: 'Hello everyone. We…', type: 'podcast',
  topic: 'tech', level: 'B1', isFavorite: false, createdAt: '2026-10-16 20:00:00', audioR2Key: 'prepared-content/cyber-faithful-1a2b3c4d.mp3',
  metadata: {
    schemaVersion: 2, audioLanguage: 'en', transcriptLanguage: 'en', durationLabel: '12 min',
    textEn: 'Hello everyone. We…', textFr: 'Bonjour à tous. Nous…',
  },
  summary: { segmentCount: 120, chunkCount: 7, grammarPointCount: 3, hasTimings: true, bodyTruncated: true, truncatedKeys: ['textEn', 'textFr'] },
};

const detail = {
  ...resume,
  body: 'Hello everyone. We need to talk.',
  metadata: {
    ...resume.metadata, textEn: 'Hello everyone. We need to talk.', textFr: 'Bonjour à tous. Nous devons parler.',
    segments: [{ id: 's001', en: 'Hello everyone.', fr: 'Bonjour à tous.', startMs: 0, endMs: 900 }],
    chunks: [], grammarPoints: [],
  },
  summary: undefined,
};

beforeEach(() => apiRequest.mockReset());

describe('liste résumée', () => {
  it('garde le résumé et en déduit les compteurs sans segments chargés', async () => {
    apiRequest.mockResolvedValueOnce({ items: [resume] }).mockResolvedValueOnce({ items: [] });
    const [item] = await learningApi.getPreparedContent('default');
    expect(isContentSummary(item)).toBe(true);
    expect(getContentSegments(item)).toEqual([]);
    expect(getContentCounts(item)).toEqual({ segments: 120, chunks: 7, grammarPoints: 3 });
    expect(item.audioUrl).toBe('/api/audio/prepared-content/cyber-faithful-1a2b3c4d.mp3');
    // L'aperçu en français reste disponible grâce au texte tronqué
    expect(getContentSummary(item)).toBe('Bonjour à tous. Nous…');
    expect(getFrenchTranslation(item)).not.toBeNull();
  });

  it('un élément complet (mock local, ancien appel) calcule ses compteurs lui-même', async () => {
    apiRequest.mockResolvedValueOnce(detail);
    const item = await learningApi.getPreparedContentItem('cyber');
    expect(isContentSummary(item)).toBe(false);
    expect(getContentCounts(item)).toEqual({ segments: 1, chunks: 0, grammarPoints: 0 });
  });
});

describe('détail à la demande', () => {
  it('appelle GET /content/:id avec un id encodé et renvoie le contenu complet', async () => {
    apiRequest.mockResolvedValueOnce(detail);
    const item = await learningApi.getPreparedContentItem('cyber 1');
    expect(apiRequest).toHaveBeenCalledWith('/content/cyber%201', undefined);
    expect(getEnglishScript(item)).toBe('Hello everyone. We need to talk.');
    expect(getContentSegments(item)).toHaveLength(1);
  });
});
