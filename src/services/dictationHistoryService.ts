import type { DictationHistory } from '@/types/dictation';

const KEY = 'english-fluency:dictation-history:v1:';

export function loadDictationHistory(profileId: string): DictationHistory {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(`${KEY}${profileId}`) ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) =>
      typeof value === 'number' && Number.isFinite(value) && value > 0));
  } catch {
    return {};
  }
}

export function saveDictationAttempt(profileId: string, phraseKey: string): void {
  try {
    const history = loadDictationHistory(profileId);
    history[phraseKey] = Math.max(Date.now(), ...Object.values(history).map((value) => value + 1));
    const recent = Object.entries(history).sort((a, b) => b[1] - a[1]).slice(0, 1000);
    localStorage.setItem(`${KEY}${profileId}`, JSON.stringify(Object.fromEntries(recent)));
  } catch { /* La dictée reste utilisable si le stockage est indisponible. */ }
}
