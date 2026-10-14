import { apiRequest, hasRemoteApi, resolveApiAsset } from '@/api/httpClient';

interface SpeechAudioResponse {
  audioUrl?: string;
}

export interface NaturalSpeechAudio {
  provider: 'openai' | 'gemini';
  url: string;
}

const OPENAI_INSTRUCTIONS = [
  'Read this English text with a natural British accent.',
  'Use a normal conversational pace and fluid intonation.',
  'Do not sound robotic, slow down unnaturally, or over-articulate.',
].join(' ');

async function requestProvider(
  provider: NaturalSpeechAudio['provider'],
  text: string,
): Promise<NaturalSpeechAudio | null> {
  const body = provider === 'openai'
    ? { text, voice: 'coral', instructions: OPENAI_INSTRUCTIONS }
    : { text, voice: 'Aoede' };

  try {
    const response = await apiRequest<SpeechAudioResponse>(`/tts/${provider}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.audioUrl) return null;
    return { provider, url: resolveApiAsset(response.audioUrl) };
  } catch {
    return null;
  }
}

export async function requestNaturalSpeech(text: string): Promise<NaturalSpeechAudio | null> {
  if (!hasRemoteApi) return null;
  return (await requestProvider('openai', text))
    ?? requestProvider('gemini', text);
}
