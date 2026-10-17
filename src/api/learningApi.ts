import { apiRequest, hasRemoteApi, resolveApiAsset } from '@/api/httpClient';
import { assimilLessonsMock, assimilProgressMock, getAssimilPreparedMock } from '@/mocks/assimilData';
import {
  dashboardMock,
  lingvistCardsMock,
  preparedContentMock,
  statisticsMock,
} from '@/mocks/learningData';
import { cleanVocabularyText, getVocabularyTranslation } from '@/helpers/vocabularyDisplay';
import { srsSessionMock, triageCandidatesMock } from '@/mocks/srsData';
import { readingItemsMock, readingSegmentsMock, srtEpisodesMock, srtScenesMock, srtSourcesMock } from '@/mocks/readingData';
import type {
  AssimilLesson,
  AssimilLevel,
  AssimilPreparedLesson,
  AssimilProgress,
  DashboardData,
  LingvistDecision,
  LingvistCard,
  PreparedContent,
  PreparedContentSummary,
  ReviewGrade,
  SrsSession,
  SrsTriageCandidate,
  SrsWord,
} from '@/types/learning';
import type { ReadingItem, ReadingSegment, SrtEpisode, SrtScene, SrtSource } from '@/types/reading';

const wait = (duration = 220) => new Promise((resolve) => window.setTimeout(resolve, duration));

interface PreparedContentResponseItem {
  id: string;
  profileId?: string;
  title: string | null;
  body: string;
  type: PreparedContent['type'];
  topic: string | null;
  level: string | null;
  metadata: Record<string, unknown>;
  audioR2Key: string | null;
  isFavorite?: boolean;
  createdAt: string;
  summary?: PreparedContentSummary;
}

function toPreparedContent(item: PreparedContentResponseItem): PreparedContent {
  return {
    id: item.id,
    profileId: item.profileId,
    title: item.title ?? 'Contenu sans titre',
    source: item.topic ?? item.type ?? 'Contenu préparé',
    durationLabel: String(item.metadata.durationLabel ?? item.metadata.duration ?? 'Audio'),
    language: String(item.metadata.language ?? 'Anglais'),
    level: item.level,
    topic: item.topic,
    body: item.body,
    audioR2Key: item.audioR2Key,
    audioUrl: item.audioR2Key ? resolveApiAsset(`/audio/${item.audioR2Key.split('/').map(encodeURIComponent).join('/')}`) : undefined,
    metadata: item.metadata,
    ...(item.summary ? { summary: item.summary } : {}),
    type: item.type,
    isFavorite: item.isFavorite,
    publishedAt: item.createdAt,
  };
}

function sameText(left: string | null, right: string | null) {
  return Boolean(left && right) && left!.toLocaleLowerCase('fr') === right!.toLocaleLowerCase('fr');
}

/**
 * Traduction affichée pour une carte Lingvist : celle de la carte, puis la
 * traduction enrichie du mot, puis l'historique. Une carte préparée avant la
 * correction porte encore l'ancienne traduction : si elle est identique à la
 * traduction historique du même mot, la version corrigée la remplace.
 */
export function resolveLingvistTranslation(cardTranslation: string | undefined, word: SrsWord | undefined): string {
  const fromCard = cleanVocabularyText(cardTranslation);
  const enriched = word?.enrichment ? cleanVocabularyText(word.enrichment.primaryTranslation) : null;
  if (fromCard && enriched && sameText(fromCard, cleanVocabularyText(word?.traduction))) return enriched;
  return fromCard ?? getVocabularyTranslation(word) ?? '';
}

type SrsStats = Omit<DashboardData, 'activeDays' | 'preparedContentCount'>;

function count(value: unknown): number {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) ? Math.max(0, number) : 0;
}

/**
 * Compteurs de /srs/stats. Un champ absent ou invalide (Worker plus ancien,
 * réponse partielle) vaut 0 au lieu de faire planter les écrans.
 */
export function normalizeSrsStats(raw: unknown): SrsStats {
  const stats = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    reviewedToday: count(stats.reviewedToday),
    dueCount: count(stats.dueCount),
    learnedCount: count(stats.learnedCount),
    totalCount: count(stats.totalCount),
    streak: count(stats.streak),
  };
}

async function localResult<T>(value: T): Promise<T> {
  await wait();
  return structuredClone(value);
}

export const learningApi = {
  async getDashboard(profileId: string) {
    if (!hasRemoteApi) return localResult(dashboardMock);
    const [stats, content] = await Promise.all([
      apiRequest<unknown>(`/srs/stats?profileId=${encodeURIComponent(profileId)}`),
      apiRequest<{ count?: number } | undefined>(`/content?profileId=${encodeURIComponent(profileId)}&limit=1`),
    ]);
    return { ...normalizeSrsStats(stats), activeDays: dashboardMock.activeDays, preparedContentCount: count(content?.count) };
  },

  async getLingvistCards(profileId: string, limit = 10) {
    if (!hasRemoteApi) return localResult(lingvistCardsMock.slice(0, limit));
    const data = await apiRequest<{ cards: (LingvistCard & { wordId?: string; qualityStatus?: string })[]; words: SrsWord[] }>(
      `/lingvist/session?profileId=${encodeURIComponent(profileId)}&limit=${limit}`,
    );
    const wordsById = new Map((data.words ?? []).map((word) => [word.id, word]));
    return data.cards.map((card, index) => {
      const word = card.wordId ? wordsById.get(card.wordId) : undefined;
      const level = ['A2', 'B1', 'B2', 'C1'].includes(word?.niveau ?? '')
        ? word!.niveau as LingvistCard['level']
        : 'B1';
      return {
        ...card,
        id: card.id ?? `lingvist-${card.wordId ?? index}`,
        level,
        wordTraductionFr: resolveLingvistTranslation(card.wordTraductionFr, word),
        srsWord: word,
      };
    });
  },

  submitLingvistAnswer(profileId: string, card: LingvistCard, answer: string, decision: LingvistDecision) {
    return hasRemoteApi
      ? apiRequest<void>('/srs/review', {
          method: 'POST',
          body: JSON.stringify({
            profileId,
            wordId: card.wordId ?? card.id,
            word: { ...(card.srsWord ?? { id: card.wordId ?? card.id, mot: card.lemma }), lastGrade: decision.grade },
            day: new Date().toISOString().slice(0, 10),
            count: 1,
            result: decision.resultKind === 'success' ? 'success' : decision.resultKind === 'almost' ? 'almost' : 'fail',
            metadata: { ...decision.metadata, userAnswer: answer, expectedAnswer: card.expectedAnswer },
          }),
        })
      : localResult(undefined);
  },

  async getPreparedContent(profileId: string) {
    if (!hasRemoteApi) return localResult(preparedContentMock);
    // Vue résumée : le détail (segments, chunks, textes) est chargé à l'ouverture
    const [profileData, globalData] = await Promise.all([
      apiRequest<{ items: PreparedContentResponseItem[] }>(`/content?profileId=${encodeURIComponent(profileId)}&limit=50&view=summary`),
      profileId === '__global__'
        ? Promise.resolve({ items: [] as PreparedContentResponseItem[] })
        : apiRequest<{ items: PreparedContentResponseItem[] }>('/content?profileId=__global__&limit=50&view=summary'),
    ]);
    const byId = new Map([...profileData.items, ...globalData.items].map((item) => [item.id, item]));
    return [...byId.values()].map(toPreparedContent);
  },

  async getPreparedContentItem(id: string) {
    if (!hasRemoteApi) {
      const item = preparedContentMock.find((entry) => entry.id === id);
      if (!item) throw new Error('Contenu introuvable');
      return localResult(item);
    }
    return toPreparedContent(await apiRequest<PreparedContentResponseItem>(`/content/${encodeURIComponent(id)}`));
  },

  deletePreparedContent(id: string) {
    return hasRemoteApi
      ? apiRequest<{ ok: boolean }>(`/content/${encodeURIComponent(id)}`, { method: 'DELETE' })
      : localResult({ ok: true });
  },

  async getStatistics(profileId: string) {
    if (!hasRemoteApi) return localResult(statisticsMock);
    const stats = await apiRequest<unknown>(`/srs/stats?profileId=${encodeURIComponent(profileId)}`);
    return { ...statisticsMock, ...normalizeSrsStats(stats) };
  },

  getSrsSession(profileId: string, limit = 100) {
    return hasRemoteApi
      ? apiRequest<SrsSession>(`/srs/session?profileId=${encodeURIComponent(profileId)}&limit=${limit}`)
      : localResult(srsSessionMock);
  },

  reviewWord(profileId: string, wordId: string, word: unknown, grade: ReviewGrade) {
    const result = grade === 'again' ? 'fail' : grade === 'hard' ? 'almost' : 'success';
    return hasRemoteApi
      ? apiRequest<void>('/srs/review', {
          method: 'POST',
          body: JSON.stringify({ profileId, wordId, word: { ...(word as object), lastGrade: grade }, day: new Date().toISOString().slice(0, 10), count: 1, result }),
        })
      : localResult(undefined);
  },

  getTriageCandidates(profileId: string, limit = 5000) {
    return hasRemoteApi
      ? apiRequest<{ words: SrsTriageCandidate[] }>(`/srs/triage?profileId=${encodeURIComponent(profileId)}&limit=${limit}`).then((data) => data.words)
      : localResult(triageCandidatesMock);
  },

  markWordsKnown(profileId: string, wordIds: string[], source: 'user_marked_known' | 'triage_focus') {
    return hasRemoteApi
      ? apiRequest<{ ok: boolean; updated: number }>('/srs/known', { method: 'POST', body: JSON.stringify({ profileId, wordIds, source }) })
      : localResult({ ok: true, updated: wordIds.length });
  },

  async getAssimilLessons(level: AssimilLevel) {
    if (!hasRemoteApi) {
      const items = level === 'all' ? assimilLessonsMock : assimilLessonsMock.filter((lesson) => lesson.level === level);
      return localResult(items);
    }
    const data = await apiRequest<{ items: AssimilLesson[] }>(`/assimil/lessons?level=${level}&limit=101`);
    return data.items.map((lesson) => ({
      ...lesson,
      title: lesson.titleEn ?? lesson.title,
      audioUrl: resolveApiAsset(lesson.audioUrl),
    }));
  },

  async getAssimilProgress(profileId: string) {
    if (!hasRemoteApi) return localResult(assimilProgressMock);
    const data = await apiRequest<{ lessons: AssimilProgress[] }>(`/assimil/progress?profileId=${encodeURIComponent(profileId)}`);
    return data.lessons ?? [];
  },

  async getAssimilPreparedLesson(index: number) {
    if (!hasRemoteApi) return localResult(getAssimilPreparedMock(index));
    const data = await apiRequest<{ lesson: AssimilPreparedLesson }>(`/assimil/lesson/${index}`);
    return {
      ...data.lesson,
      title: data.lesson.titleEn ?? data.lesson.title,
      audioUrl: resolveApiAsset(data.lesson.audioUrl),
    };
  },

  async getReadingItems(level = 'Tout') {
    if (!hasRemoteApi) return localResult(level === 'Tout' ? readingItemsMock : readingItemsMock.filter((item) => item.level === level));
    const query = level === 'Tout' ? '' : `?level=${encodeURIComponent(level)}`;
    const data = await apiRequest<{ items: ReadingItem[] }>(`/reading-library/items${query}`);
    return data.items ?? [];
  },

  async getReadingSegments(itemId: string) {
    if (!hasRemoteApi) return localResult(readingSegmentsMock[itemId] ?? []);
    const data = await apiRequest<{ items: ReadingSegment[] }>(`/reading-library/items/${encodeURIComponent(itemId)}/segments`);
    return data.items ?? [];
  },

  promoteReadingVocabulary(profileId: string, level: string, vocabulary: string[], example: string) {
    const words = vocabulary.slice(0, 5).map((term) => ({ term, definition_fr: term, example }));
    return hasRemoteApi
      ? apiRequest<{ created: number; promoted: number }>('/articles/promote-words', { method: 'POST', body: JSON.stringify({ level, profileId, vocabulary: words }) })
      : localResult({ created: words.length, promoted: words.length });
  },

  async getSrtSources() {
    if (!hasRemoteApi) return localResult(srtSourcesMock);
    const data = await apiRequest<{ items: SrtSource[] }>('/srt/sources');
    return data.items ?? [];
  },

  async getSrtEpisodes(sourceId: string) {
    if (!hasRemoteApi) return localResult(srtEpisodesMock[sourceId] ?? []);
    const data = await apiRequest<{ items: SrtEpisode[] }>(`/srt/sources/${encodeURIComponent(sourceId)}/episodes`);
    return data.items ?? [];
  },

  async getSrtScenes(episodeId: string) {
    if (!hasRemoteApi) return localResult(srtScenesMock[episodeId] ?? []);
    const data = await apiRequest<{ items: SrtScene[] }>(`/srt/episodes/${encodeURIComponent(episodeId)}/scenes`);
    return data.items ?? [];
  },
};
