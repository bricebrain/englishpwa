/**
 * Non-régression LOT 0 — contrat entre la PWA et le Worker.
 * On simule le client HTTP pour vérifier ce que la PWA envoie au Worker et
 * comment elle interprète ses réponses, sans réseau.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

vi.mock('@/api/httpClient', () => ({
  hasRemoteApi: true,
  apiRequest: (path: string, init?: RequestInit) => apiRequest(path, init),
  resolveApiAsset: (path: string) => `/api${path}`,
}));

const { learningApi } = await import('@/api/learningApi');
const { rangeEnrichmentMock } = await import('@/mocks/srsData');
const { getEnglishScript, getFrenchTranslation, getContentSegments, getContentChunks, isEnglishContent } = await import('@/helpers/preparedContent');

// Contenu publié par l'ancien atelier (avant le format bilingue) : forme réelle
// des deux contenus encore en production le 16/10/2026.
const ancienContenuFr = {
  id: 'pourquoi-la-can-va-repasser-tous-les-deux-ans', profileId: 'default', title: 'Pourquoi la CAN…',
  body: 'The African Cup of Nations will now be played every four years.', type: 'podcast', topic: 'culture', level: 'B1',
  metadata: {
    sourceType: 'youtube', sourceUrl: 'https://www.youtube.com/watch?v=6y96iYvPZFY', audioLanguage: 'fr', transcriptLanguage: 'fr',
    adaptedFile: '', translationFile: 'x.translation.en.txt', transcriptFile: 'x.transcript.fr.txt',
    transcriptText: 'La Coupe d’Afrique des nations se jouera désormais tous les quatre ans.',
  },
  audioR2Key: 'prepared-content/pourquoi-la-can-va-repasser-tous-les-deux-ans.mp3', isFavorite: false, createdAt: '2026-10-12 22:33:31',
};

// Contenu publié par l'atelier actuel (metadata.schemaVersion 2)
const contenuBilingue = {
  id: 'cyber', profileId: '__global__', title: 'WTF is happening with Cybersecurity?', body: 'Hello everyone.', type: 'podcast',
  topic: 'tech', level: 'B1', isFavorite: false, createdAt: '2026-10-16 20:00:00', audioR2Key: 'prepared-content/cyber.mp3',
  metadata: {
    schemaVersion: 2, audioLanguage: 'en', transcriptLanguage: 'en', textEn: 'Hello everyone.', textFr: 'Bonjour à tous.',
    durationLabel: '12 min', segments: [{ id: 's001', en: 'Hello everyone.', fr: 'Bonjour à tous.', startMs: null, endMs: null }],
    chunks: [{ id: 'c001', expression: 'hello everyone', meaningFr: 'bonjour à tous', level: 'A2', type: 'useful_expression', sourceSegmentId: 's001' }],
  },
};

beforeEach(() => apiRequest.mockReset());

describe('getPreparedContent', () => {
  it('fusionne le profil et __global__, et construit l’URL audio depuis audioR2Key', async () => {
    apiRequest.mockImplementation(async (path?: string) => {
      if (path?.startsWith('/content?profileId=default')) return { items: [ancienContenuFr] };
      if (path?.startsWith('/content?profileId=__global__')) return { items: [contenuBilingue] };
      return undefined;
    });
    const contenus = await learningApi.getPreparedContent('default');
    expect(apiRequest).toHaveBeenCalledWith('/content?profileId=default&limit=50&view=summary', undefined);
    expect(apiRequest).toHaveBeenCalledWith('/content?profileId=__global__&limit=50&view=summary', undefined);
    expect(contenus.map((c) => c.id)).toEqual(['pourquoi-la-can-va-repasser-tous-les-deux-ans', 'cyber']);
    expect(contenus[0].audioUrl).toBe('/api/audio/prepared-content/pourquoi-la-can-va-repasser-tous-les-deux-ans.mp3');
    expect(contenus[1].durationLabel).toBe('12 min');
    expect(contenus[0].durationLabel).toBe('Audio');
  });

  it('lit toujours correctement un ancien contenu (source FR, sans segments)', async () => {
    apiRequest.mockResolvedValueOnce({ items: [ancienContenuFr] }).mockResolvedValueOnce({ items: [] });
    const [ancien] = await learningApi.getPreparedContent('default');
    expect(isEnglishContent(ancien)).toBe(true);
    expect(getEnglishScript(ancien)).toBe(ancienContenuFr.body);
    expect(getFrenchTranslation(ancien)).toBe(ancienContenuFr.metadata.transcriptText);
    expect(getContentSegments(ancien)).toEqual([]);
    expect(getContentChunks(ancien)).toEqual([]);
  });

  it('lit un contenu bilingue de l’atelier', async () => {
    apiRequest.mockResolvedValueOnce({ items: [] }).mockResolvedValueOnce({ items: [contenuBilingue] });
    const [bilingue] = await learningApi.getPreparedContent('default');
    expect(getEnglishScript(bilingue)).toBe('Hello everyone.');
    expect(getFrenchTranslation(bilingue)).toBe('Bonjour à tous.');
    expect(getContentSegments(bilingue)).toHaveLength(1);
    expect(getContentChunks(bilingue)).toHaveLength(1);
  });

  it('supprime un contenu par DELETE /content/:id', async () => {
    apiRequest.mockResolvedValueOnce({ ok: true });
    await learningApi.deletePreparedContent('a b');
    expect(apiRequest).toHaveBeenCalledWith('/content/a%20b', { method: 'DELETE' });
  });
});

describe('Révisions SRS envoyées au Worker', () => {
  it('reviewWord envoie profileId, wordId, word, day et count (champs exigés par /srs/review)', async () => {
    apiRequest.mockResolvedValueOnce(undefined);
    await learningApi.reviewWord('default', 'still_0609', { id: 'still_0609', prochaine_revision: '2026-10-20' }, 'good');
    const [path, init] = apiRequest.mock.calls[0];
    expect(path).toBe('/srs/review');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ profileId: 'default', wordId: 'still_0609', count: 1, result: 'success' });
    expect(body.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.word).toMatchObject({ id: 'still_0609', lastGrade: 'good' });
  });

  it('getDashboard combine /srs/stats et le nombre de contenus', async () => {
    apiRequest.mockImplementation(async (path?: string) => {
      if (path?.startsWith('/srs/stats')) return { dueCount: 3, learnedCount: 10, totalCount: 4617, newCount: 4600, reviewedToday: 2, streak: 1 };
      if (path?.startsWith('/content')) return { count: 7 };
      return undefined;
    });
    const tableau = await learningApi.getDashboard('default');
    expect(tableau).toMatchObject({ dueCount: 3, preparedContentCount: 7 });
  });
});

describe('Vocabulaire enrichi joint par le Worker', () => {
  const motEnrichi = { id: 'range_1879', mot: 'range', traduction: 'intervalle', niveau: 'B1', type: 'word', enrichment: rangeEnrichmentMock };
  const motHistorique = { id: 'still_0609', mot: 'still', traduction: 'encore', niveau: 'B1', type: 'word' };
  const carte = (wordId: string, wordTraductionFr?: string) => ({
    id: `card-${wordId}`, wordId, lemma: wordId.split('_')[0], expectedAnswer: 'range', sentenceWithGap: 'Prices ____ from 10 to 20.',
    sentenceFull: 'Prices range from 10 to 20.', translationFr: 'Les prix vont de 10 à 20.', grammarHint: '', level: 'B1',
    ...(wordTraductionFr === undefined ? {} : { wordTraductionFr }),
  });

  it('/srs/session conserve enrichment, et un mot sans enrichissement reste accepté', async () => {
    apiRequest.mockResolvedValueOnce({ words: [motEnrichi, motHistorique], reviewHistory: {}, dueCount: 1, newCount: 1 });
    const session = await learningApi.getSrsSession('default');
    expect(session.words[0]?.enrichment?.displayForm).toBe('to range');
    expect(session.words[1]?.enrichment).toBeUndefined();
  });

  it('/srs/triage conserve enrichment', async () => {
    apiRequest.mockResolvedValueOnce({ words: [{ ...motEnrichi, frequence: 4 }, { ...motHistorique, frequence: 5 }] });
    const candidats = await learningApi.getTriageCandidates('default');
    expect(candidats[0]?.enrichment?.lemma).toBe('range');
    expect(candidats[1]?.enrichment).toBeUndefined();
  });

  it('/lingvist/session utilise la traduction enrichie en repli et garde enrichment dans srsWord', async () => {
    apiRequest.mockResolvedValueOnce({ cards: [carte('range_1879')], words: [motEnrichi] });
    const [card] = await learningApi.getLingvistCards('default');
    expect(card?.wordTraductionFr).toBe('aller de… à…');
    expect(card?.srsWord?.enrichment?.version).toBe(1);
  });

  it('/lingvist/session corrige une ancienne carte préparée avec la traduction historique', async () => {
    apiRequest.mockResolvedValueOnce({ cards: [carte('range_1879', 'intervalle')], words: [motEnrichi] });
    const [card] = await learningApi.getLingvistCards('default');
    expect(card?.wordTraductionFr).toBe('aller de… à…');
  });

  it('/lingvist/session garde une traduction de carte spécifique à la phrase', async () => {
    apiRequest.mockResolvedValueOnce({ cards: [carte('range_1879', 'varier entre')], words: [motEnrichi] });
    const [card] = await learningApi.getLingvistCards('default');
    expect(card?.wordTraductionFr).toBe('varier entre');
  });

  it('/lingvist/session sans enrichissement garde la traduction historique', async () => {
    apiRequest.mockResolvedValueOnce({ cards: [carte('still_0609')], words: [motHistorique] });
    const [card] = await learningApi.getLingvistCards('default');
    expect(card?.wordTraductionFr).toBe('encore');
  });

  it('/srs/review envoie toujours le même wordId historique', async () => {
    apiRequest.mockResolvedValueOnce(undefined);
    await learningApi.reviewWord('default', motEnrichi.id, motEnrichi, 'good');
    const body = JSON.parse(apiRequest.mock.calls[0][1].body);
    expect(body.wordId).toBe('range_1879');
    expect(body.word.id).toBe('range_1879');
  });

  it('n’appelle jamais les routes d’administration', async () => {
    apiRequest.mockResolvedValue({ words: [], cards: [], reviewHistory: {}, dueCount: 0, newCount: 0 });
    await learningApi.getSrsSession('default');
    await learningApi.getTriageCandidates('default');
    await learningApi.getLingvistCards('default');
    expect(apiRequest.mock.calls.some(([path]) => String(path).includes('/admin/'))).toBe(false);
    apiRequest.mockReset();
  });
});

describe('Tableau de bord tolérant aux réponses partielles', () => {
  it('remplace les compteurs absents de /srs/stats par 0 au lieu de planter', async () => {
    apiRequest.mockImplementation(async (path?: string) => {
      if (path?.startsWith('/srs/stats')) return { dueCount: 3, reviewedToday: '2' };
      if (path?.startsWith('/content')) return {};
      return undefined;
    });
    const tableau = await learningApi.getDashboard('default');
    expect(tableau).toMatchObject({ dueCount: 3, reviewedToday: 2, learnedCount: 0, totalCount: 0, streak: 0, preparedContentCount: 0 });
    apiRequest.mockReset();
  });

  it('les statistiques ne reprennent pas de faux compteurs de démonstration', async () => {
    apiRequest.mockResolvedValueOnce({ dueCount: 1 });
    const stats = await learningApi.getStatistics('default');
    expect(stats).toMatchObject({ dueCount: 1, learnedCount: 0, totalCount: 0 });
  });
});

describe('Compatibilité avec le Worker déployé sans totalCount', () => {
  it('reconstruit le total depuis learnedCount + newCount', async () => {
    apiRequest.mockImplementation(async (path?: string) => {
      if (path?.startsWith('/srs/stats')) return { dueCount: 4, learnedCount: 1760, newCount: 2857, reviewedToday: 0, streak: 2 };
      if (path?.startsWith('/content')) return { count: 3 };
      return undefined;
    });
    const tableau = await learningApi.getDashboard('default');
    expect(tableau.totalCount).toBe(4617);
    apiRequest.mockReset();
  });

  it('ne laisse jamais le total sous le nombre de mots appris', async () => {
    apiRequest.mockImplementation(async (path?: string) => (path?.startsWith('/srs/stats') ? { learnedCount: 1760 } : { count: 0 }));
    const tableau = await learningApi.getDashboard('default');
    expect(tableau.totalCount).toBe(1760);
    apiRequest.mockReset();
  });
});
