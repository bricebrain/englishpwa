import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

vi.mock('@/api/httpClient', () => ({
  hasRemoteApi: true,
  apiRequest: (path: string, init?: RequestInit) => apiRequest(path, init),
  resolveApiAsset: (path: string) => `/api${path}`,
}));

const { requestNaturalSpeech } = await import('@/api/speechApi');

beforeEach(() => apiRequest.mockReset());

describe('requestNaturalSpeech', () => {
  it('utilise Deepgram en premier', async () => {
    apiRequest.mockResolvedValueOnce({ audioUrl: '/audio/tts/deepgram/aura-2-pandora-en/abc.mp3' });
    const audio = await requestNaturalSpeech('range');
    expect(apiRequest).toHaveBeenCalledWith('/tts/deepgram', { method: 'POST', body: JSON.stringify({ text: 'range' }) });
    expect(audio).toEqual({ provider: 'deepgram', url: '/api/audio/tts/deepgram/aura-2-pandora-en/abc.mp3' });
  });

  it('retombe sur OpenAI puis Gemini si Deepgram échoue', async () => {
    apiRequest
      .mockRejectedValueOnce(new Error('API 502'))
      .mockRejectedValueOnce(new Error('API 502'))
      .mockResolvedValueOnce({ audioUrl: '/audio/tts/gemini/x.wav' });
    const audio = await requestNaturalSpeech('range');
    expect(apiRequest.mock.calls.map((call) => call[0])).toEqual(['/tts/deepgram', '/tts/openai', '/tts/gemini']);
    expect(audio?.provider).toBe('gemini');
  });
});
