import { requestNaturalSpeech } from '@/api/speechApi';
import { splitSpeechText } from '@/helpers/speechText';

let playbackId = 0;
let activeAudio: HTMLAudioElement | null = null;

export function canSpeak(): boolean {
  return 'speechSynthesis' in window || typeof Audio !== 'undefined';
}

function stopCurrentPlayback(): number {
  playbackId += 1;
  window.speechSynthesis?.cancel();

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute('src');
    activeAudio.load();
    activeAudio = null;
  }

  return playbackId;
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const language = voice.lang.toLowerCase();
  let score = language === 'en-gb' ? 45 : language.startsWith('en-') ? 30 : 0;

  if (/natural|premium|enhanced/.test(name)) score += 100;
  if (/serena|daniel|arthur|sonia|ryan|ava|samantha|karen|moira/.test(name)) score += 55;
  if (/google.*english|microsoft/.test(name)) score += 35;
  if (voice.localService) score += 5;
  if (/compact|espeak|festival/.test(name)) score -= 80;
  return score;
}

function selectEnglishVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith('en'))
    .sort((left, right) => scoreVoice(right) - scoreVoice(left))[0];
}

function playAudio(url: string, currentPlaybackId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (currentPlaybackId !== playbackId) {
      resolve();
      return;
    }

    const audio = new Audio(url);
    activeAudio = audio;
    audio.preload = 'auto';

    const finish = (error?: Error) => {
      audio.onended = null;
      audio.onerror = null;
      if (activeAudio === audio) activeAudio = null;
      if (error) reject(error);
      else resolve();
    };

    audio.onended = () => finish();
    audio.onerror = () => finish(new Error('Lecture audio TTS impossible.'));
    audio.play().catch((error: unknown) => {
      finish(error instanceof Error ? error : new Error('Lecture audio TTS impossible.'));
    });
  });
}

function playNativeSpeech(text: string, currentPlaybackId: number): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || currentPlaybackId !== playbackId) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.voice = selectEnglishVoice() ?? null;
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopEnglishSpeech(): void {
  stopCurrentPlayback();
}

export async function speakEnglish(text: string): Promise<void> {
  if (!canSpeak()) return;
  const currentPlaybackId = stopCurrentPlayback();
  const chunks = splitSpeechText(text);

  for (const chunk of chunks) {
    if (currentPlaybackId !== playbackId) return;
    const generatedAudio = await requestNaturalSpeech(chunk);
    if (currentPlaybackId !== playbackId) return;

    if (generatedAudio) {
      try {
        await playAudio(generatedAudio.url, currentPlaybackId);
        continue;
      } catch {
        // Le TTS natif reste disponible si le fichier distant ne peut pas être lu.
      }
    }

    await playNativeSpeech(chunk, currentPlaybackId);
  }
}
