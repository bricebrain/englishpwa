import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

vi.mock('@/api/httpClient', () => ({
  hasRemoteApi: true,
  apiRequest: (path: string, init?: RequestInit) => apiRequest(path, init),
  resolveApiAsset: (path: string) => path,
}));

const { analyzeLingvistAnswer } = await import('@/api/lingvistAnalysisApi');
const { lingvistCardsMock } = await import('@/mocks/learningData');

const card = lingvistCardsMock[0]!;
const workerAnalysis = {
  result: 'almost', score: 0.6, shortFeedback: 'Presque', explanation: 'Explication Workers AI',
  examples: ['Prices range from 10 to 20 euros.'], commonMistakes: [], usageCases: [],
};

beforeEach(() => apiRequest.mockReset());

describe('analyzeLingvistAnswer', () => {
  it('n’appelle pas l’IA si la vérification locale suffit', async () => {
    const analysis = await analyzeLingvistAnswer(card, card.expectedAnswer);
    expect(analysis.result).toBe('success');
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('passe par /lingvist/analyze avec le contexte de la carte', async () => {
    apiRequest.mockResolvedValueOnce({ analysis: workerAnalysis, provider: 'workers-ai' });
    const analysis = await analyzeLingvistAnswer(card, 'banana');
    expect(apiRequest).toHaveBeenCalledTimes(1);
    const [path, init] = apiRequest.mock.calls[0]!;
    expect(path).toBe('/lingvist/analyze');
    expect(JSON.parse(init.body)).toMatchObject({ answer: 'banana', card: { expectedAnswer: card.expectedAnswer, wordTraductionFr: card.wordTraductionFr } });
    expect(analysis).toMatchObject({ result: 'almost', explanation: 'Explication Workers AI' });
  });

  it('revient à l’appel DeepSeek historique si la route est absente', async () => {
    apiRequest
      .mockRejectedValueOnce(new Error('API 404'))
      .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ ...workerAnalysis, explanation: 'Explication DeepSeek' }) } }] });
    const analysis = await analyzeLingvistAnswer(card, 'banana');
    expect(apiRequest.mock.calls[1]![0]).toBe('/proxy/deepseek/v1/chat/completions');
    expect(analysis.explanation).toBe('Explication DeepSeek');
  });

  it('garde l’analyse locale si tout échoue', async () => {
    apiRequest.mockRejectedValueOnce(new Error('route absente')).mockRejectedValueOnce(new Error('réseau'));
    const analysis = await analyzeLingvistAnswer(card, 'banana');
    expect(apiRequest).toHaveBeenCalledTimes(2);
    expect(analysis.result).toBe('fail');
  });
});
