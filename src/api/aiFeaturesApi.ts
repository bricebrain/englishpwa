import { apiRequest, hasRemoteApi } from '@/api/httpClient';
import {
  dailySentencesMock,
  dailyStoryMock,
  liveAnalysisMock,
  searchSemanticMock,
  wordContextsMock,
} from '@/mocks/aiFeaturesData';
import type {
  DailySentences,
  DailyStory,
  LiveAnalysis,
  PassageSource,
  SemanticResult,
  WordContext,
} from '@/types/aiFeatures';

const wait = (duration = 260) => new Promise((resolve) => window.setTimeout(resolve, duration));

async function local<T>(value: T): Promise<T> {
  await wait();
  return structuredClone(value);
}

/** Taille maximale d'un envoi à /articles/promote-words (limite du Worker). */
export const PROMOTE_BATCH = 5;

export const aiFeaturesApi = {
  async searchSemantic(query: string, source?: PassageSource): Promise<SemanticResult[]> {
    if (!hasRemoteApi) return local(searchSemanticMock(query).filter((item) => !source || item.source === source));
    const params = new URLSearchParams({ q: query, limit: '10' });
    if (source) params.set('source', source);
    const data = await apiRequest<{ results?: SemanticResult[] }>(`/search/semantic?${params}`);
    return data?.results ?? [];
  },

  async getWordContexts(word: string, limit = 3): Promise<WordContext[]> {
    if (!hasRemoteApi) return local(wordContextsMock(word));
    const params = new URLSearchParams({ word, limit: String(limit) });
    const data = await apiRequest<{ contexts?: WordContext[] }>(`/search/word-contexts?${params}`);
    return data?.contexts ?? [];
  },

  async getDailySentences(profileId: string): Promise<DailySentences | null> {
    if (!hasRemoteApi) return local(dailySentencesMock);
    const data = await apiRequest<{ payload?: DailySentences }>(`/exercises/daily?profileId=${encodeURIComponent(profileId)}&kind=sentences`);
    return data?.payload?.exercises?.length ? data.payload : null;
  },

  async getDailyStory(profileId: string): Promise<DailyStory | null> {
    if (!hasRemoteApi) return local(dailyStoryMock);
    const data = await apiRequest<{ payload?: DailyStory }>(`/exercises/daily?profileId=${encodeURIComponent(profileId)}&kind=story`);
    return data?.payload?.textEn ? data.payload : null;
  },

  async analyzeLiveReport(profileId: string, report: string): Promise<LiveAnalysis> {
    if (!hasRemoteApi) return local(liveAnalysisMock);
    const data = await apiRequest<{ analysis: LiveAnalysis }>('/live/analyze', {
      method: 'POST',
      body: JSON.stringify({ profileId, report }),
    });
    return data.analysis;
  },

  /** Ajoute des expressions au SRS (dues immédiatement), par lots de 5. */
  async addExpressionsToSrs(profileId: string, expressions: LiveAnalysis['expressions']): Promise<number> {
    if (!hasRemoteApi) return local(expressions.length);
    let added = 0;
    for (let start = 0; start < expressions.length; start += PROMOTE_BATCH) {
      const batch = expressions.slice(start, start + PROMOTE_BATCH);
      const result = await apiRequest<{ created?: number; promoted?: number }>('/articles/promote-words', {
        method: 'POST',
        body: JSON.stringify({
          profileId,
          level: 'B1',
          vocabulary: batch.map((item) => ({ term: item.en, definition_fr: item.fr, example: item.example || item.en })),
        }),
      });
      added += result?.promoted ?? batch.length;
    }
    return added;
  },
};
