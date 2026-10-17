import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

vi.mock('@/api/httpClient', () => ({
  hasRemoteApi: true,
  apiRequest: (path: string, init?: RequestInit) => apiRequest(path, init),
  resolveApiAsset: (path: string) => path,
}));

const { aiFeaturesApi } = await import('@/api/aiFeaturesApi');

beforeEach(() => apiRequest.mockReset());

describe('aiFeaturesApi — contrat avec le Worker', () => {
  it('recherche par le sens avec filtre de source', async () => {
    apiRequest.mockResolvedValueOnce({ results: [{ refId: 'r1', text: 'x' }] });
    const results = await aiFeaturesApi.searchSemantic('parler d’argent', 'reading');
    expect(apiRequest.mock.calls[0]![0]).toBe('/search/semantic?q=parler+d%E2%80%99argent&limit=10&source=reading');
    expect(results).toHaveLength(1);
  });

  it('contextes d’un mot', async () => {
    apiRequest.mockResolvedValueOnce({ contexts: [{ sentence: 'Prices range from…' }] });
    await aiFeaturesApi.getWordContexts('range');
    expect(apiRequest.mock.calls[0]![0]).toBe('/search/word-contexts?word=range&limit=3');
  });

  it('exercices et histoire du jour, null si vides', async () => {
    apiRequest
      .mockResolvedValueOnce({ payload: { exercises: [{ prompt: 'a', expected: 'b c d', hint: '', distractors: [] }] } })
      .mockResolvedValueOnce({ payload: { exercises: [] } })
      .mockResolvedValueOnce({ payload: { title: 'T', textEn: 'Once upon a time.' } });
    expect((await aiFeaturesApi.getDailySentences('default'))?.exercises).toHaveLength(1);
    expect(await aiFeaturesApi.getDailySentences('default')).toBeNull();
    expect((await aiFeaturesApi.getDailyStory('default'))?.title).toBe('T');
    expect(apiRequest.mock.calls[2]![0]).toBe('/exercises/daily?profileId=default&kind=story');
  });

  it('ajoute les expressions au SRS par lots de 5 via /articles/promote-words', async () => {
    apiRequest.mockResolvedValue({ promoted: 5 });
    const expressions = Array.from({ length: 7 }, (_, index) => ({ en: `expr ${index}`, fr: `fr ${index}`, example: '' }));
    apiRequest.mockResolvedValueOnce({ promoted: 5 }).mockResolvedValueOnce({ promoted: 2 });
    expect(await aiFeaturesApi.addExpressionsToSrs('default', expressions)).toBe(7);
    expect(apiRequest).toHaveBeenCalledTimes(2);
    const body = JSON.parse(apiRequest.mock.calls[0]![1].body);
    expect(body).toMatchObject({ profileId: 'default', level: 'B1' });
    expect(body.vocabulary).toHaveLength(5);
    expect(body.vocabulary[0]).toEqual({ term: 'expr 0', definition_fr: 'fr 0', example: 'expr 0' });
  });

  it('analyse un bilan Live', async () => {
    apiRequest.mockResolvedValueOnce({ id: 'x', analysis: { summaryFr: 's', strengths: [], errors: [], expressions: [] } });
    await aiFeaturesApi.analyzeLiveReport('default', 'bilan');
    expect(apiRequest.mock.calls[0]![0]).toBe('/live/analyze');
    expect(JSON.parse(apiRequest.mock.calls[0]![1].body)).toEqual({ profileId: 'default', report: 'bilan' });
  });
});
